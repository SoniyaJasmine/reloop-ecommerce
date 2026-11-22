
from django.urls import path

from .views import (
    CategoryListView,
    ProductListView,
    AdminProductListView,
    AdminProductDetailView,
    AdminCategoryListCreateView,
    AdminCategoryDetailView,
)

urlpatterns = [
    path("", ProductListView.as_view(), name="product-list"),
    path("categories/", CategoryListView.as_view(), name="category-list"),

    # Admin product/inventory/category management
    path("admin/products/", AdminProductListView.as_view(), name="admin-product-list"),
    path("admin/products/<int:frontend_id>/", AdminProductDetailView.as_view(), name="admin-product-detail"),
    path("admin/categories/", AdminCategoryListCreateView.as_view(), name="admin-category-list-create"),
    path("admin/categories/<int:pk>/", AdminCategoryDetailView.as_view(), name="admin-category-detail"),
]
