from datetime import timedelta
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

import razorpay
from django.conf import settings
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Count, F, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from coupons.models import Coupon
from products.models import Product
from submissions.models import ProductSubmission
from .models import Order, OrderItem
from .serializers import AdminOrderSerializer, OrderSerializer


def get_razorpay_client():
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


def _quantize_money(value):
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _validate_and_lock_coupon(coupon_code, subtotal):
    if not coupon_code:
        return None, Decimal("0.00")

    code = str(coupon_code).strip().upper()
    if not code:
        return None, Decimal("0.00")

    coupon = Coupon.objects.select_for_update().filter(code__iexact=code).first()
    if not coupon:
        raise ValueError("Invalid coupon code.")

    ok, errors, discount = coupon.can_apply_to_amount(subtotal)
    if not ok:
        raise ValueError(errors[0] if errors else "Invalid coupon.")

    return coupon, _quantize_money(discount)


class CreateOrderView(APIView):

    def post(self, request):
        data = request.data
        items = data.get("items", [])

        if not isinstance(items, list) or not items:
            return Response(
                {"error": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        required_fields = [
            "full_name", "email", "phone", "address",
            "city", "state", "pincode", "payment_method"
        ]

        for field in required_fields:
            if not data.get(field):
                return Response(
                    {"error": f"{field.replace('_', ' ').title()} is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        payment_method = data["payment_method"]

        if payment_method not in ["razorpay", "cod"]:
            return Response(
                {"error": "Invalid payment method."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                product_ids = set()

                for item in items:
                    product_id = int(item["product_id"])
                    quantity = int(item["quantity"])

                    if quantity < 1:
                        raise ValueError("Invalid product quantity.")

                    product_ids.add(product_id)

                products = Product.objects.select_for_update().filter(
                    frontend_id__in=product_ids,
                    is_active=True
                )

                product_map = {
                    product.frontend_id: product
                    for product in products
                }

                subtotal = Decimal("0.00")
                validated_items = []

                for item in items:
                    product_id = int(item["product_id"])
                    quantity = int(item["quantity"])

                    product = product_map.get(product_id)

                    if not product:
                        raise ValueError(
                            f"Product {product_id} is unavailable."
                        )

                    if product.stock < quantity:
                        raise ValueError(
                            f"Insufficient stock for {product.name}."
                        )

                    subtotal += product.price * quantity
                    validated_items.append((product, quantity))

                subtotal = _quantize_money(subtotal)
                delivery_charge = Decimal("0.00")

                coupon_code = data.get("coupon_code")
                coupon, discount_amount = _validate_and_lock_coupon(coupon_code, subtotal)

                total_amount = subtotal + delivery_charge - discount_amount
                if total_amount < Decimal("0.00"):
                    total_amount = Decimal("0.00")
                total_amount = _quantize_money(total_amount)

                order = Order.objects.create(
                    user=request.user if request.user.is_authenticated else None,
                    full_name=data["full_name"],
                    email=data["email"],
                    phone=data["phone"],
                    address=data["address"],
                    city=data["city"],
                    state=data["state"],
                    pincode=data["pincode"],
                    subtotal=subtotal,
                    delivery_charge=delivery_charge,
                    discount_amount=discount_amount,
                    coupon_code=coupon.code if coupon else "",
                    coupon=coupon,
                    total_amount=total_amount,
                    payment_method=payment_method,
                    payment_status="pending",
                    order_status="pending"
                )

                for product, quantity in validated_items:
                    OrderItem.objects.create(
                        order=order,
                        product_id=product.frontend_id,
                        product_name=product.name,
                        product_image=product.image,
                        condition=product.condition,
                        price=product.price,
                        quantity=quantity
                    )

                if payment_method == "cod":
                    for product, quantity in validated_items:
                        product.stock -= quantity
                        product.save(update_fields=["stock"])

                    order.order_status = "confirmed"
                    order.save(update_fields=["order_status"])

                    if coupon:
                        coupon.times_used = (coupon.times_used or 0) + 1
                        coupon.save(update_fields=["times_used"])

                    return Response({
                        "message": "COD order placed successfully.",
                        "order_number": order.order_number,
                        "subtotal": str(order.subtotal),
                        "discount_amount": str(order.discount_amount),
                        "coupon_code": order.coupon_code,
                        "total_amount": str(order.total_amount)
                    }, status=status.HTTP_201_CREATED)

                client = get_razorpay_client()

                razorpay_order = client.order.create({
                    "amount": int(total_amount * 100),
                    "currency": "INR",
                    "receipt": order.order_number
                })

                order.razorpay_order_id = razorpay_order["id"]
                order.save(update_fields=["razorpay_order_id"])

                return Response({
                    "order_number": order.order_number,
                    "razorpay_order_id": razorpay_order["id"],
                    "amount": int(total_amount * 100),
                    "currency": "INR",
                    "key": settings.RAZORPAY_KEY_ID,
                    "subtotal": str(order.subtotal),
                    "discount_amount": str(order.discount_amount),
                    "coupon_code": order.coupon_code,
                    "total_amount": str(order.total_amount),
                }, status=status.HTTP_201_CREATED)

        except (ValueError, KeyError, TypeError, InvalidOperation) as error:
            return Response(
                {"error": str(error) or "Invalid order details."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception:
            return Response(
                {"error": "Unable to create the order. Please try again."},
                status=status.HTTP_502_BAD_GATEWAY
            )


class VerifyPaymentView(APIView):

    def post(self, request):
        data = request.data

        order_number = data.get("order_number")
        razorpay_order_id = data.get("razorpay_order_id")
        razorpay_payment_id = data.get("razorpay_payment_id")
        razorpay_signature = data.get("razorpay_signature")

        if not all([
            order_number,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        ]):
            return Response(
                {"error": "Payment verification details are incomplete."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                order = Order.objects.select_for_update().get(
                    order_number=order_number
                )

                if order.payment_status == "paid":
                    return Response({
                        "message": "Payment was already verified.",
                        "order_number": order.order_number
                    })

                if (
                    order.payment_method != "razorpay"
                    or order.razorpay_order_id != razorpay_order_id
                ):
                    return Response(
                        {"error": "Invalid order details."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                client = get_razorpay_client()

                client.utility.verify_payment_signature({
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature
                })

                order_items = order.items.all()

                for item in order_items:
                    product = Product.objects.select_for_update().get(
                        frontend_id=item.product_id
                    )

                    if product.stock < item.quantity:
                        return Response(
                            {"error": f"Insufficient stock for {product.name}."},
                            status=status.HTTP_409_CONFLICT
                        )

                    product.stock -= item.quantity
                    product.save(update_fields=["stock"])

                if order.coupon_id:
                    coupon = Coupon.objects.select_for_update().get(pk=order.coupon_id)
                    coupon.times_used = (coupon.times_used or 0) + 1
                    coupon.save(update_fields=["times_used"])

                order.payment_status = "paid"
                order.order_status = "confirmed"
                order.razorpay_payment_id = razorpay_payment_id
                order.save(update_fields=[
                    "payment_status",
                    "order_status",
                    "razorpay_payment_id"
                ])

                return Response({
                    "message": "Payment verified successfully.",
                    "order_number": order.order_number
                })

        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except razorpay.errors.SignatureVerificationError:
            return Response(
                {"error": "Payment verification failed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception:
            return Response(
                {"error": "Unable to verify payment. Please contact support."},
                status=status.HTTP_400_BAD_REQUEST
            )


class TrackOrderView(APIView):

    def post(self, request):
        order_number = request.data.get("order_number", "").strip()
        email = request.data.get("email", "").strip()

        if not order_number or not email:
            return Response(
                {"error": "Order number and email are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.prefetch_related("items").get(
                order_number__iexact=order_number,
                email__iexact=email
            )

            order_items = [
                {
                    "product_name": item.product_name,
                    "product_image": item.product_image,
                    "condition": item.condition,
                    "price": str(item.price),
                    "quantity": item.quantity,
                    "item_total": str(item.item_total),
                }
                for item in order.items.all()
            ]

            return Response({
                "order_number": order.order_number,
                "order_status": order.order_status,
                "payment_method": order.payment_method,
                "payment_status": order.payment_status,
                "subtotal": str(order.subtotal),
                "delivery_charge": str(order.delivery_charge),
                "discount_amount": str(order.discount_amount),
                "coupon_code": order.coupon_code,
                "total_amount": str(order.total_amount),
                "created_at": order.created_at,
                "items": order_items,
            }, status=status.HTTP_200_OK)

        except Order.DoesNotExist:
            return Response(
                {"error": "No order found. Please check your order number and email."},
                status=status.HTTP_404_NOT_FOUND
            )

class MyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = (
            Order.objects
            .filter(user=request.user)
            .prefetch_related("items")
            .order_by("-created_at")
        )

        orders_data = []

        for order in orders:
            items = [
                {
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "product_image": item.product_image,
                    "condition": item.condition,
                    "price": str(item.price),
                    "quantity": item.quantity,
                    "item_total": str(item.item_total),
                }
                for item in order.items.all()
            ]

            orders_data.append({
                "order_number": order.order_number,
                "created_at": order.created_at,
                "order_status": order.order_status,
                "payment_method": order.payment_method,
                "payment_status": order.payment_status,
                "subtotal": str(order.subtotal),
                "delivery_charge": str(order.delivery_charge),
                "discount_amount": str(order.discount_amount),
                "coupon_code": order.coupon_code,
                "total_amount": str(order.total_amount),
                "items": items,
            })

        return Response(orders_data, status=status.HTTP_200_OK)


ALLOWED_ORDER_STATUS_TRANSITIONS = {
    "pending": {"confirmed", "processing", "cancelled"},
    "confirmed": {"processing", "shipped", "delivered", "cancelled"},
    "processing": {"shipped", "delivered", "cancelled"},
    "shipped": {"delivered", "cancelled"},
    "delivered": set(),
    "cancelled": set(),
}


def _order_stock_was_deducted(order):
    if order.payment_method == "cod":
        return order.order_status in {"confirmed", "processing", "shipped", "delivered"}
    # Razorpay/test: stock deducted on successful payment verification
    return order.payment_status == "paid" and order.order_status in {
        "confirmed",
        "processing",
        "shipped",
        "delivered",
    }


def _restore_order_stock(order):
    for item in order.items.all():
        try:
            product = Product.objects.select_for_update().get(frontend_id=item.product_id)
            product.stock = (product.stock or 0) + int(item.quantity)
            product.save(update_fields=["stock"])
        except Product.DoesNotExist:
            # If product record no longer exists, skip restoration for that item
            continue


class AdminOrderListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = Order.objects.prefetch_related("items").all().order_by("-created_at")
        search = (request.query_params.get("search") or "").strip()
        order_status = (request.query_params.get("order_status") or "").strip()
        payment_status = (request.query_params.get("payment_status") or "").strip()

        if search:
            qs = qs.filter(
                Q(order_number__icontains=search)
                | Q(full_name__icontains=search)
                | Q(email__icontains=search)
                | Q(phone__icontains=search)
            )
        if order_status:
            qs = qs.filter(order_status=order_status)
        if payment_status:
            qs = qs.filter(payment_status=payment_status)

        serializer = AdminOrderSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminOrderDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, order_number):
        try:
            order = Order.objects.prefetch_related("items").get(order_number__iexact=order_number)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdminOrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminOrderStatusUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, order_number):
        new_status = (request.data.get("order_status") or "").strip().lower()
        valid_statuses = {choice[0] for choice in Order.ORDER_STATUS_CHOICES}
        if new_status not in valid_statuses:
            return Response(
                {"error": "Invalid order status.", "valid_statuses": sorted(valid_statuses)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                order = Order.objects.select_for_update().prefetch_related("items").get(
                    order_number__iexact=order_number
                )
                current_status = order.order_status

                if new_status == current_status:
                    return Response(AdminOrderSerializer(order).data, status=status.HTTP_200_OK)

                allowed = ALLOWED_ORDER_STATUS_TRANSITIONS.get(current_status, set())
                if new_status not in allowed:
                    return Response(
                        {
                            "error": f"Invalid status transition from '{current_status}' to '{new_status}'.",
                            "allowed_transitions": sorted(allowed),
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Prevent cancelling delivered orders via this flow
                if new_status == "cancelled" and current_status == "delivered":
                    return Response(
                        {"error": "Delivered orders cannot be cancelled."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if new_status == "cancelled" and current_status != "cancelled":
                    # Restore stock only if it had been deducted for this order lifecycle
                    if _order_stock_was_deducted(order):
                        _restore_order_stock(order)

                    # For unpaid online orders cancelled before payment confirmation, keep payment pending.
                    # For COD/paid orders, cancellation does not imply refund completion in this system.
                    order.order_status = "cancelled"
                    order.save(update_fields=["order_status", "updated_at"])
                else:
                    order.order_status = new_status
                    order.save(update_fields=["order_status", "updated_at"])

                refreshed = Order.objects.prefetch_related("items").get(pk=order.pk)
                return Response(AdminOrderSerializer(refreshed).data, status=status.HTTP_200_OK)

        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response(
                {"error": "Unable to update order status."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class CancelMyOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_number):
        customer_cancellable_statuses = {"pending", "confirmed", "processing"}

        try:
            with transaction.atomic():
                order = (
                    Order.objects.select_for_update()
                    .prefetch_related("items")
                    .filter(order_number__iexact=order_number, user=request.user)
                    .first()
                )

                if not order:
                    return Response(
                        {"error": "Order not found."},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                current_status = (order.order_status or "").lower()

                if current_status == "cancelled":
                    refreshed = Order.objects.prefetch_related("items").get(pk=order.pk)
                    return Response(
                        {
                            "message": "Order is already cancelled.",
                            "order": OrderSerializer(refreshed).data,
                        },
                        status=status.HTTP_200_OK,
                    )

                if current_status == "delivered":
                    return Response(
                        {"error": "Delivered orders cannot be cancelled."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if current_status not in customer_cancellable_statuses:
                    return Response(
                        {
                            "error": "This order can no longer be cancelled. Please contact support if you need help."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if _order_stock_was_deducted(order):
                    _restore_order_stock(order)

                order.order_status = "cancelled"
                order.save(update_fields=["order_status", "updated_at"])

                refreshed = Order.objects.prefetch_related("items").get(pk=order.pk)
                return Response(
                    {
                        "message": "Order cancelled successfully.",
                        "order": OrderSerializer(refreshed).data,
                    },
                    status=status.HTTP_200_OK,
                )

        except Exception:
            return Response(
                {"error": "Unable to cancel the order. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        successful_order_statuses = ["confirmed", "processing", "shipped", "delivered"]
        orders_qs = Order.objects.all()
        successful_orders = orders_qs.filter(order_status__in=successful_order_statuses)

        total_sales = successful_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")
        total_orders = orders_qs.count()
        total_products = Product.objects.count()
        total_users = User.objects.filter(is_staff=False).count() or User.objects.count()
        pending_orders = orders_qs.filter(order_status="pending").count()
        delivered_orders = orders_qs.filter(order_status="delivered").count()
        pending_submissions = ProductSubmission.objects.filter(status="Pending").count()
        approved_submissions = ProductSubmission.objects.filter(status="Approved").count()

        recent_orders = []
        for order in orders_qs.prefetch_related("items").order_by("-created_at")[:8]:
            recent_orders.append(
                {
                    "order_number": order.order_number,
                    "full_name": order.full_name,
                    "email": order.email,
                    "total_amount": str(order.total_amount),
                    "order_status": order.order_status,
                    "payment_status": order.payment_status,
                    "payment_method": order.payment_method,
                    "created_at": order.created_at,
                    "items_count": order.items.count(),
                }
            )

        best_selling = (
            OrderItem.objects.filter(order__order_status__in=successful_order_statuses)
            .values("product_id", "product_name")
            .annotate(
                total_quantity=Sum("quantity"),
                total_revenue=Sum(F("price") * F("quantity")),
                order_count=Count("order_id", distinct=True),
            )
            .order_by("-total_quantity", "-total_revenue")[:5]
        )
        best_selling_products = [
            {
                "product_id": row["product_id"],
                "product_name": row["product_name"],
                "total_quantity": int(row["total_quantity"] or 0),
                "total_revenue": str(row["total_revenue"] or Decimal("0.00")),
                "order_count": int(row["order_count"] or 0),
            }
            for row in best_selling
        ]

        days = int(request.query_params.get("days", 30) or 30)
        days = max(7, min(days, 90))
        start_date = timezone.localdate() - timedelta(days=days - 1)
        sales_chart_qs = (
            successful_orders.filter(created_at__date__gte=start_date)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(
                sales=Sum("total_amount"),
                orders=Count("id"),
            )
            .order_by("day")
        )
        sales_by_day = {row["day"]: row for row in sales_chart_qs}
        sales_chart = []
        for i in range(days):
            day = start_date + timedelta(days=i)
            row = sales_by_day.get(day)
            sales_chart.append(
                {
                    "date": day.isoformat(),
                    "label": day.strftime("%b %d"),
                    "sales": str((row["sales"] if row else Decimal("0.00")) or Decimal("0.00")),
                    "orders": int((row["orders"] if row else 0) or 0),
                }
            )

        # Inventory summary for dashboard
        low_stock_threshold = int(request.query_params.get("low_stock_threshold", 5) or 5)
        low_stock_products = Product.objects.filter(is_active=True, stock__gt=0, stock__lte=low_stock_threshold).count()
        out_of_stock_products = Product.objects.filter(is_active=True, stock__lte=0).count()

        return Response(
            {
                "stats": {
                    "total_sales": str(total_sales),
                    "total_orders": total_orders,
                    "total_products": total_products,
                    "total_registered_users": total_users,
                    "pending_orders": pending_orders,
                    "delivered_orders": delivered_orders,
                    "pending_product_submissions": pending_submissions,
                    "approved_product_submissions": approved_submissions,
                    "low_stock_products": low_stock_products,
                    "out_of_stock_products": out_of_stock_products,
                },
                "recent_orders": recent_orders,
                "best_selling_products": best_selling_products,
                "sales_chart": sales_chart,
            },
            status=status.HTTP_200_OK,
        )