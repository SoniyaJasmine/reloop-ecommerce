from rest_framework import serializers

from .models import Enquiry


class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = [
            "id",
            "customer_name",
            "email",
            "mobile_number",
            "subject",
            "message",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate_customer_name(self, value):
        value = (value or "").strip()
        if len(value) < 2:
            raise serializers.ValidationError("Customer name must be at least 2 characters.")
        return value

    def validate_email(self, value):
        return (value or "").strip().lower()

    def validate_mobile_number(self, value):
        digits = "".join(ch for ch in str(value or "") if ch.isdigit())
        if len(digits) < 10 or len(digits) > 15:
            raise serializers.ValidationError("Enter a valid mobile number (10-15 digits).")
        return digits

    def validate_subject(self, value):
        value = (value or "").strip()
        if len(value) < 3:
            raise serializers.ValidationError("Subject must be at least 3 characters.")
        return value

    def validate_message(self, value):
        value = (value or "").strip()
        if len(value) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters.")
        if len(value) > 2000:
            raise serializers.ValidationError("Message is too long.")
        return value
