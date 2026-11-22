
from rest_framework import serializers

from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "is_active", "product_count"]
        read_only_fields = ["id", "slug", "product_count"]

    def get_product_count(self, obj):
        return Product.objects.filter(category__iexact=obj.name, is_active=True).count()


class ProductSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="frontend_id", read_only=True)
    original = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "category",
            "description",
            "price",
            "original",
            "condition",
            "image",
            "stock",
        ]


class AdminProductSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="frontend_id", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "frontend_id",
            "name",
            "category",
            "description",
            "price",
            "original",
            "condition",
            "image",
            "stock",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "frontend_id", "created_at", "updated_at"]


class AdminCategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "is_active", "product_count", "created_at", "updated_at"]
        read_only_fields = ["id", "slug", "product_count", "created_at", "updated_at"]

    def get_product_count(self, obj):
        return Product.objects.filter(category__iexact=obj.name).count()

    def validate_name(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Category name is required.")
        qs = Category.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A category with this name already exists.")
        return value
