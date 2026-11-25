from django.db.models import Avg, Count
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import OrderItem
from products.models import Product
from .models import Review
from .serializers import ReviewSerializer

SUCCESSFUL_ORDER_STATUSES = {"confirmed", "processing", "shipped", "delivered"}


def _get_product_or_404(product_id):
    # Frontend uses product frontend_id as `id`
    return get_object_or_404(Product, frontend_id=product_id, is_active=True)


def _user_has_purchased_product(user, product):
    if not user or not user.is_authenticated:
        return False
    return OrderItem.objects.filter(
        order__user=user,
        order__order_status__in=SUCCESSFUL_ORDER_STATUSES,
        product_id=product.frontend_id,
    ).exists()


class ProductReviewListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, product_id):
        product = _get_product_or_404(product_id)
        reviews = Review.objects.filter(product=product).select_related("user")
        serializer = ReviewSerializer(reviews, many=True, context={"request": request})
        stats = reviews.aggregate(
            average_rating=Avg("rating"),
            total_reviews=Count("id"),
        )
        avg = stats.get("average_rating") or 0
        has_purchased = _user_has_purchased_product(request.user, product)
        has_reviewed = bool(
            request.user.is_authenticated
            and Review.objects.filter(product=product, user=request.user).exists()
        )
        return Response(
            {
                "product_id": product.frontend_id,
                "average_rating": round(float(avg), 1) if avg else 0,
                "total_reviews": stats.get("total_reviews") or 0,
                "reviews": serializer.data,
                "can_review": bool(has_purchased and not has_reviewed),
                "has_purchased": has_purchased,
                "has_reviewed": has_reviewed,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, product_id):
        product = _get_product_or_404(product_id)

        if not _user_has_purchased_product(request.user, product):
            return Response(
                {"error": "You can review this product only after a successful purchase."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if Review.objects.filter(product=product, user=request.user).exists():
            return Response(
                {"error": "You have already reviewed this product."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ReviewSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            review = serializer.save(user=request.user, product=product)
            return Response(
                ReviewSerializer(review, context={"request": request}).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IsReviewOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id


class ReviewDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsReviewOwner]

    def get_object(self, request, pk):
        review = get_object_or_404(Review.objects.select_related("user", "product"), pk=pk)
        self.check_object_permissions(request, review)
        return review

    def put(self, request, pk):
        review = self.get_object(request, pk)
        serializer = ReviewSerializer(review, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        review = self.get_object(request, pk)
        serializer = ReviewSerializer(
            review, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        review = self.get_object(request, pk)
        review.delete()
        return Response({"message": "Review deleted successfully."}, status=status.HTTP_200_OK)
