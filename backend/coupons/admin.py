from django.contrib import admin

from .models import Coupon


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "discount_type",
        "discount_value",
        "min_order_amount",
        "expiry_date",
        "usage_limit",
        "times_used",
        "is_active",
    )
    list_filter = ("discount_type", "is_active", "expiry_date")
    search_fields = ("code",)
    list_editable = ("is_active",)
    readonly_fields = ("times_used", "created_at", "updated_at")
