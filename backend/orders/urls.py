
from django.urls import path

from .views import (
    CreateOrderView,
    VerifyPaymentView,
    TrackOrderView,
    MyOrdersView,
    CancelMyOrderView,
    AdminOrderListView,
    AdminOrderDetailView,
    AdminOrderStatusUpdateView,
    AdminDashboardStatsView,
)

urlpatterns = [
    path("create/", CreateOrderView.as_view(), name="create-order"),
    path("verify/", VerifyPaymentView.as_view(), name="verify-payment"),
    path("track/", TrackOrderView.as_view(), name="track-order"),
    path("my-orders/", MyOrdersView.as_view(), name="my-orders"),
    path("cancel/<str:order_number>/", CancelMyOrderView.as_view(), name="cancel-my-order"),

    # Admin dashboard and order management
    path("admin/dashboard/", AdminDashboardStatsView.as_view(), name="admin-dashboard-stats"),
    path("admin/list/", AdminOrderListView.as_view(), name="admin-order-list"),
    path("admin/detail/<str:order_number>/", AdminOrderDetailView.as_view(), name="admin-order-detail"),
    path(
        "admin/status/<str:order_number>/",
        AdminOrderStatusUpdateView.as_view(),
        name="admin-order-status-update",
    ),
]
