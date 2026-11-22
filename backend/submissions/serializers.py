
from rest_framework import serializers
from .models import ProductSubmission


class ProductSubmissionSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductSubmission
        fields = [
            "id",
            "seller_name",
            "email",
            "phone",
            "product_name",
            "category",
            "description",
            "condition",
            "image",
            "expected_price",
            "status",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "status",
            "created_at",
        ]

    def validate_phone(self, value):
        if not value.isdigit() or len(value) < 10:
            raise serializers.ValidationError(
                "Enter a valid phone number."
            )
        return value

    def validate_expected_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Expected price must be greater than zero."
            )
        return value
