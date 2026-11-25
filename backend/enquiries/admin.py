from django.contrib import admin

from .models import Enquiry


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer_name",
        "email",
        "mobile_number",
        "subject",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("customer_name", "email", "mobile_number", "subject", "message")
    readonly_fields = ("created_at", "updated_at")
    list_editable = ("status",)
    ordering = ("-created_at",)
