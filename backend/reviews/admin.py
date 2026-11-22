from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "user", "rating", "created_at", "updated_at")
    list_filter = ("rating", "created_at")
    search_fields = ("comment", "user__username", "user__email", "product__name")
    autocomplete_fields = ("user", "product")
