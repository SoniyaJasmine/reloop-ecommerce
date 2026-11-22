from django.contrib import admin

from .models import Address


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
