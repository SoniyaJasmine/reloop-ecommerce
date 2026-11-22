from rest_framework import serializers

from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = Coupon
        fields = [
            "id",
            "code",
            "discount_type",
            "discount_value",
            "min_order_amount",
            "expiry_date",
            "usage_limit",
            "times_used",
            "is_active",
            "is_expired",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "times_used", "is_expired", "created_at", "updated_at"]


class ApplyCouponSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)

    def validate_code(self, value):
        value = (value or "").strip().upper()
        if not value:
            raise serializers.ValidationError("Coupon code is required.")
        return value
