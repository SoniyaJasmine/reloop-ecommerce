
from django.contrib import admin
from django.core.exceptions import ValidationError
from django.db.models import Max

from .models import ProductSubmission
from products.models import Product


@admin.register(ProductSubmission)
class ProductSubmissionAdmin(admin.ModelAdmin):

    list_display = (
        "product_name",
        "seller_name",
        "category",
        "condition",
        "expected_price",
        "admin_price",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "condition",
        "category",
    )

    search_fields = (
        "product_name",
        "seller_name",
        "email",
        "phone",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = ("-created_at",)

    def save_model(self, request, obj, form, change):

        if obj.status == "Approved" and not obj.admin_price:
            raise ValidationError(
                "Enter the approved selling price before approval."
            )

        super().save_model(request, obj, form, change)

        if obj.status == "Approved":

            if obj.listed_product:
                product = obj.listed_product

                product.price = obj.admin_price
                product.original = obj.expected_price
                product.condition = obj.condition
                product.is_active = True

                if obj.image:
                    product.image = request.build_absolute_uri(
                        obj.image.url
                    )

                product.save()

            else:
                last_id = (
                    Product.objects.aggregate(
                        max_id=Max("frontend_id")
                    )["max_id"] or 0
                )

                product = Product.objects.create(
                    frontend_id=last_id + 1,
                    name=obj.product_name,
                    category=obj.category,
                    description=obj.description,
                    price=obj.admin_price,
                    original=obj.expected_price,
                    condition=obj.condition,
                    image=request.build_absolute_uri(
                        obj.image.url
                    ),
                    stock=1,
                    is_active=True,
                )

                obj.listed_product = product
                obj.save(update_fields=["listed_product"])

        elif obj.status == "Rejected" and obj.listed_product:

            obj.listed_product.is_active = False
            obj.listed_product.save(update_fields=["is_active"])
