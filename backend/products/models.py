
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.name = (self.name or "").strip()
        if not self.slug and self.name:
            base = slugify(self.name) or "category"
            slug = base
            i = 1
            qs = Category.objects.exclude(pk=self.pk)
            while qs.filter(slug=slug).exists():
                i += 1
                slug = f"{base}-{i}"
            self.slug = slug
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if Product.objects.filter(category__iexact=self.name).exists():
            raise ValidationError(
                "This category cannot be deleted because products are assigned to it."
            )
        return super().delete(*args, **kwargs)


class Product(models.Model):
    CONDITION_CHOICES = [
        ("Like New", "Like New"),
        ("Excellent", "Excellent"),
        ("Very Good", "Very Good"),
        ("Good", "Good"),
    ]

    frontend_id = models.PositiveIntegerField(unique=True)

    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)

    description = models.TextField(blank=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)
    original = models.DecimalField(max_digits=10, decimal_places=2)

    condition = models.CharField(
        max_length=30,
        choices=CONDITION_CHOICES,
    )

    image = models.URLField(max_length=500, blank=True)

    stock = models.PositiveIntegerField(default=1)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def clean(self):
        super().clean()
        if self.category:
            self.category = self.category.strip()
            if not Category.objects.filter(name__iexact=self.category, is_active=True).exists():
                # allow legacy categories if none configured yet? but if categories exist, enforce
                if Category.objects.exists():
                    raise ValidationError({"category": "Select a valid active category."})
