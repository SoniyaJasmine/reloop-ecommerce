
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Wishlist
from .serializers import WishlistSerializer
from products.models import Product


class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    # GET: Display logged-in user's wishlist
    def get(self, request):
        wishlist = (
            Wishlist.objects
            .filter(
                user=request.user,
                product__is_active=True
            )
            .select_related("product")
        )

        serializer = WishlistSerializer(wishlist, many=True)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # POST: Add product to wishlist
    def post(self, request):
        product_id = request.data.get("product_id")

        if not product_id:
            return Response(
                {"error": "Product ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            product = Product.objects.get(
                frontend_id=product_id,
                is_active=True
            )
        except (Product.DoesNotExist, ValueError, TypeError):
            return Response(
                {"error": "Product not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user,
            product=product
        )

        serializer = WishlistSerializer(wishlist_item)

        return Response(
            {
                "message": (
                    "Product added successfully."
                    if created
                    else "Product already exists in wishlist."
                ),
                "wishlist": serializer.data
            },
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            )
        )

    # DELETE: Remove product from wishlist
    def delete(self, request, product_id):
        wishlist_item = Wishlist.objects.filter(
            user=request.user,
            product__frontend_id=product_id
        )

        if not wishlist_item.exists():
            return Response(
                {"error": "Product not found in wishlist."},
                status=status.HTTP_404_NOT_FOUND
            )

        wishlist_item.delete()

        return Response(
            {"message": "Product removed successfully."},
            status=status.HTTP_200_OK
        )
