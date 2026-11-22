
import uuid

from django.conf import settings
from django.db import models


def generate_order_number():
    return f"RL{uuid.uuid4().hex[:10].upper()}"


class Order(models.Model):

    PAYMENT_CHOICES = [
        ("cod", "Cash on Delivery"),
        ("test", "Test Payment"),
        ("razorpay", "Razorpay"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]

    ORDER_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    order_number = models.CharField(
        max_length=20,
        unique=True,
        default=generate_order_number,
    )

    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=10)

    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=6)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    coupon_code = models.CharField(max_length=50, blank=True)
    coupon = models.ForeignKey(
        "coupons.Coupon",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES,
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="pending",
    )

    order_status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS_CHOICES,
        default="pending",
    )

    razorpay_order_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    razorpay_payment_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    # Product snapshot at the time of ordering
    product_id = models.PositiveIntegerField()
    product_name = models.CharField(max_length=255)
    product_image = models.URLField(max_length=500, blank=True)
    condition = models.CharField(max_length=50, blank=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.product_name} - {self.order.order_number}"

    @property
    def item_total(self):
        return self.price * self.quantity
