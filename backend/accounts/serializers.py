from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Address


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    confirm_password = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "confirm_password",
        ]

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "is_staff",
            "is_active",
            "date_joined",
            "last_login",
        ]

        read_only_fields = ["id", "username", "email", "is_staff", "is_active", "date_joined", "last_login"]


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "is_staff",
            "is_active",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "username", "email", "is_staff", "date_joined", "last_login"]


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "full_name",
            "phone_number",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "postal_code",
            "country",
            "is_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_phone_number(self, value):
        digits = "".join(ch for ch in str(value) if ch.isdigit())
        if len(digits) < 10 or len(digits) > 15:
            raise serializers.ValidationError(
                "Enter a valid phone number (10-15 digits)."
            )
        return digits

    def validate_postal_code(self, value):
        value = str(value).strip()
        if len(value) < 4 or len(value) > 10:
            raise serializers.ValidationError(
                "Enter a valid postal code."
            )
        return value

    def validate(self, attrs):
        required_fields = [
            "full_name",
            "phone_number",
            "address_line_1",
            "city",
            "state",
            "postal_code",
            "country",
        ]
        errors = {}
        for field in required_fields:
            value = attrs.get(field)
            if value is None:
                # allow partial updates to omit unchanged fields
                if self.instance and field in self.initial_data:
                    errors[field] = "This field is required."
                continue
            if isinstance(value, str) and not value.strip():
                errors[field] = "This field may not be blank."
        if errors:
            raise serializers.ValidationError(errors)
        return attrs

