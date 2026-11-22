
from django.conf import settings
from django.db import models


class ProductSubmission(models.Model):

    CONDITION_CHOICES = [
        ("Like New", "Like New"),
        ("Excellent", "Excellent"),
        ("Very Good", "Very Good"),
        ("Good", "Good"),
    ]

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="product_submissions",
    )

    seller_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=15)

    product_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    description = models.TextField()
    condition = models.CharField(
        max_length=30,
        choices=CONDITION_CHOICES,
    )

    image = models.ImageField(upload_to="submissions/")

    expected_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    admin_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    inspection_notes = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    listed_product = models.OneToOneField(
        "products.Product",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="source_submission",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product_name} - {self.status}"
