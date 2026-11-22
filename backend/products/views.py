
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    AdminProductSerializer,
    AdminCategorySerializer,
)


class ProductListView(ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Product.objects.filter(
            is_active=True
        ).order_by("-created_at")


class CategoryListView(ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Category.objects.filter(is_active=True).order_by("name")


class AdminProductListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = Product.objects.all().order_by("-updated_at", "-created_at")
        search = (request.query_params.get("search") or "").strip()
        category = (request.query_params.get("category") or "").strip()
        stock_filter = (request.query_params.get("stock") or "").strip().lower()
        is_active = request.query_params.get("is_active")

        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(category__icontains=search))
        if category:
            qs = qs.filter(category__iexact=category)
        if is_active is not None and is_active != "":
            val = str(is_active).lower()
            if val in ("true", "1", "yes"):
                qs = qs.filter(is_active=True)
            elif val in ("false", "0", "no"):
                qs = qs.filter(is_active=False)

        if stock_filter == "out":
            qs = qs.filter(stock__lte=0)
        elif stock_filter == "low":
            threshold = int(request.query_params.get("threshold", 5) or 5)
            qs = qs.filter(stock__gt=0, stock__lte=threshold)
        elif stock_filter == "in":
            qs = qs.filter(stock__gt=0)

        serializer = AdminProductSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminProductDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, frontend_id):
        try:
            return Product.objects.get(frontend_id=frontend_id)
        except Product.DoesNotExist:
            return None

    def get(self, request, frontend_id):
        product = self.get_object(frontend_id)
        if not product:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(AdminProductSerializer(product).data, status=status.HTTP_200_OK)

    def patch(self, request, frontend_id):
        product = self.get_object(frontend_id)
        if not product:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        allowed_fields = {"name", "category", "description", "price", "original", "condition", "image", "stock", "is_active"}
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        if not data:
            return Response({"error": "No valid fields provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Basic stock validation
        if "stock" in data:
            try:
                stock_val = int(data["stock"])
                if stock_val < 0:
                    return Response({"error": "Stock cannot be negative."}, status=status.HTTP_400_BAD_REQUEST)
                data["stock"] = stock_val
            except (TypeError, ValueError):
                return Response({"error": "Stock must be a valid integer."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = AdminProductSerializer(product, data=data, partial=True)
        if serializer.is_valid():
            try:
                instance = serializer.save()
                # run model validation for category rules when category exists
                instance.full_clean()
                instance.save()
            except DjangoValidationError as exc:
                if hasattr(exc, "message_dict"):
                    return Response(exc.message_dict, status=status.HTTP_400_BAD_REQUEST)
                return Response({"error": exc.messages}, status=status.HTTP_400_BAD_REQUEST)
            return Response(AdminProductSerializer(instance).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminCategoryListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = Category.objects.all().order_by("name")
        serializer = AdminCategorySerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AdminCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminCategoryDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        try:
            return Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return None

    def get(self, request, pk):
        category = self.get_object(pk)
        if not category:
            return Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(AdminCategorySerializer(category).data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        category = self.get_object(pk)
        if not category:
            return Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)

        old_name = category.name
        serializer = AdminCategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            # If category renamed, update product assignments to keep consistency
            if old_name != updated.name:
                Product.objects.filter(category__iexact=old_name).update(category=updated.name)
            return Response(AdminCategorySerializer(updated).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        category = self.get_object(pk)
        if not category:
            return Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            category.delete()
        except DjangoValidationError as exc:
            return Response({"error": "; ".join(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)
