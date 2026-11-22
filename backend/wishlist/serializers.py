
from rest_framework import serializers
from .models import Wishlist


class WishlistSerializer(serializers.ModelSerializer):
    frontend_id = serializers.IntegerField(
        source="product.frontend_id",
        read_only=True
    )

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    product_image = serializers.CharField(
        source="product.image",
        read_only=True
    )

    product_price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    original_price = serializers.DecimalField(
        source="product.original",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    condition = serializers.CharField(
        source="product.condition",
        read_only=True
    )

    category = serializers.CharField(
        source="product.category",
        read_only=True
    )

    stock = serializers.IntegerField(
        source="product.stock",
        read_only=True
    )

    class Meta:
        model = Wishlist
        fields = [
            "id",
            "product",
            "frontend_id",
            "product_name",
            "product_image",
            "product_price",
            "original_price",
            "condition",
            "category",
            "stock",
            "created_at",
        ]
