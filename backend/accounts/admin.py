from django.contrib import admin

from .models import Address, LoginOTP, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "phone_number", "created_at", "updated_at")
    search_fields = ("user__username", "user__email", "phone_number")


@admin.register(LoginOTP)
class LoginOTPAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "mobile_number",
        "expires_at",
        "attempts",
        "max_attempts",
        "resend_count",
        "is_verified",
        "created_at",
    )
    list_filter = ("is_verified", "created_at")
    search_fields = ("user__username", "user__email", "mobile_number", "session_token")
    readonly_fields = (
        "user",
        "otp_hash",
        "mobile_number",
        "expires_at",
        "attempts",
        "max_attempts",
        "resend_count",
        "last_sent_at",
        "is_verified",
        "session_token",
        "created_at",
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "full_name",
        "phone_number",
        "city",
        "state",
        "postal_code",
        "country",
        "is_default",
        "updated_at",
    )
    list_filter = ("is_default", "country", "state", "city")
    search_fields = (
        "full_name",
        "phone_number",
        "address_line_1",
        "address_line_2",
        "city",
        "state",
        "postal_code",
        "user__username",
        "user__email",
    )
