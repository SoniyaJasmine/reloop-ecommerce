
from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    item_total = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_id",
            "product_name",
            "product_image",
            "condition",
            "price",
            "quantity",
            "item_total",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "full_name",
            "email",
            "phone",
            "address",
            "city",
            "state",
            "pincode",
            "subtotal",
            "delivery_charge",
            "discount_amount",
            "coupon_code",
            "total_amount",
            "payment_method",
            "payment_status",
            "order_status",
            "razorpay_payment_id",
            "items",
            "created_at",
        ]


class AdminOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_username = serializers.CharField(source="user.username", read_only=True, default="")
    customer_id = serializers.IntegerField(source="user.id", read_only=True, default=None)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer_id",
            "customer_username",
            "full_name",
            "email",
            "phone",
            "address",
            "city",
            "state",
            "pincode",
            "subtotal",
            "delivery_charge",
            "discount_amount",
            "coupon_code",
            "total_amount",
            "payment_method",
            "payment_status",
            "order_status",
            "razorpay_order_id",
            "razorpay_payment_id",
            "items",
            "created_at",
            "updated_at",
        ]
