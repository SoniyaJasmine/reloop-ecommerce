from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Review

User = get_user_model()


class ReviewUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "name"]

    def get_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.username


class ReviewSerializer(serializers.ModelSerializer):
    user = ReviewUserSerializer(read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id",
            "user",
            "rating",
            "comment",
            "is_owner",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "is_owner", "created_at", "updated_at"]

    def get_is_owner(self, obj):
        request = self.context.get("request")
        return bool(request and request.user.is_authenticated and obj.user_id == request.user.id)

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate_comment(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Review comment is required.")
        if len(value) > 2000:
            raise serializers.ValidationError("Review comment is too long.")
        return value
