from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ("percentage", "Percentage"),
        ("fixed", "Fixed amount"),
    ]

    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))]
    )
    min_order_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00"), validators=[MinValueValidator(Decimal("0.00"))]
    )
    expiry_date = models.DateTimeField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True, help_text="Maximum total uses; blank for unlimited.")
    times_used = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.code

    def save(self, *args, **kwargs):
        if self.code:
            self.code = self.code.strip().upper()
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return bool(self.expiry_date and self.expiry_date < timezone.now())

    def can_apply_to_amount(self, amount):
        errors = []
        if not self.is_active:
            errors.append("This coupon is inactive.")
        if self.is_expired:
            errors.append("This coupon has expired.")
        if self.usage_limit is not None and self.times_used >= self.usage_limit:
            errors.append("This coupon has reached its usage limit.")
        try:
            amt = Decimal(str(amount))
        except Exception:
            errors.append("Invalid order amount.")
            return False, errors, Decimal("0.00")
        if amt < self.min_order_amount:
            errors.append(
                f"Minimum order amount for this coupon is ₹{self.min_order_amount}."
            )
        if errors:
            return False, errors, Decimal("0.00")

        if self.discount_type == "percentage":
            discount = (amt * self.discount_value) / Decimal("100")
            # cap percentage reasonably
            if self.discount_value > 100:
                discount = amt
        else:
            discount = self.discount_value

        if discount > amt:
            discount = amt
        discount = discount.quantize(Decimal("0.01"))
        return True, [], discount
