
from django import forms
from django.contrib import admin, messages
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import Category, Product


class ProductAdminForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        category_names = list(Category.objects.filter(is_active=True).order_by("name").values_list("name", flat=True))
        if self.instance and self.instance.pk and self.instance.category:
            if self.instance.category not in category_names:
                category_names.append(self.instance.category)
        if category_names:
            self.fields["category"] = forms.ChoiceField(
                choices=[("", "---------")] + [(name, name) for name in category_names],
                required=True,
            )
        else:
            self.fields["category"] = forms.CharField(required=True, max_length=100)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("is_active",)

    def delete_model(self, request, obj):
        try:
            obj.delete()
        except DjangoValidationError as exc:
            self.message_user(request, "; ".join(exc.messages), level=messages.ERROR)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            try:
                obj.delete()
            except DjangoValidationError as exc:
                self.message_user(request, f"{obj}: {'; '.join(exc.messages)}", level=messages.ERROR)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = (
        "frontend_id",
        "name",
        "category",
        "price",
        "condition",
        "stock",
        "is_active",
    )

    list_filter = (
        "category",
        "condition",
        "is_active",
    )

    search_fields = ("name", "category")

    list_editable = ("price", "stock", "is_active")
