
from django.core.management.base import BaseCommand
from products.models import Product


PRODUCTS = [
    (1, "MacBook Air M1", "Electronics", 34999, 52900, "Excellent", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=85"),
    (2, "Minimal Study Chair", "Furniture", 4299, 6999, "Very Good", "https://images.unsplash.com/photo-1503602642458-232111445657?w=900&q=85"),
    (3, "Classic Digital Camera", "Electronics", 12999, 18999, "Excellent", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&q=85"),
    (4, "Everyday Notebook Set", "Stationery", 399, 699, "Like New", "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=900&q=85"),
    (5, "Wireless Headphones", "Audio", 2499, 3999, "Very Good", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=85"),
    (6, "Oppo A7 5G", "Mobiles", 8999, 13999, "Good", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=85"),
    (7, "Modern Reading Chair", "Furniture", 5799, 8999, "Excellent", "https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=900&q=85"),
    (8, "The Design of Everyday Things", "Books", 299, 599, "Very Good", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900&q=85"),
    (9, "Premium Bluetooth Speaker", "Audio", 1799, 2999, "Excellent", "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&q=85"),
    (10, "Classic Mechanical Keyboard", "Electronics", 2499, 3999, "Very Good", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900&q=85"),
    (11, "Minimal Wooden Side Table", "Furniture", 1899, 3299, "Good", "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=900&q=85"),
    (12, "Vintage Reading Collection", "Books", 499, 899, "Very Good", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=900&q=85"),
    (13, "Wireless Charging Stand", "Mobiles", 899, 1499, "Like New", "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=900&q=85"),
    (14, "Creative Desk Organizer", "Stationery", 349, 599, "Excellent", "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=900&q=85"),
    (15, "Compact Digital Camera", "Electronics", 8999, 12999, "Very Good", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&q=85"),
    (16, "Contemporary Lounge Chair", "Furniture", 6499, 9999, "Excellent", "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=85"),
]


class Command(BaseCommand):
    help = "Import RELOOP frontend products into Django"

    def handle(self, *args, **kwargs):
        created_count = 0
        updated_count = 0

        for product in PRODUCTS:
            frontend_id, name, category, price, original, condition, image = product

            _, created = Product.objects.update_or_create(
                frontend_id=frontend_id,
                defaults={
                    "name": name,
                    "category": category,
                    "price": price,
                    "original": original,
                    "condition": condition,
                    "image": image,
                    "stock": 1,
                    "is_active": True,
                },
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Import completed! Created: {created_count}, Updated: {updated_count}"
            )
        )
