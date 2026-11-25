
from django.urls import path

from .views import (
    AddressDetailView,
    AddressListCreateView,
    AdminUserDetailView,
    AdminUserListView,
    ForgotPasswordView,
    LoginView,
    LogoutView,
    ProfileView,
    RegisterView,
    ResendLoginOTPView,
    ResetPasswordView,
    VerifyLoginOTPView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("login/verify-otp/", VerifyLoginOTPView.as_view(), name="login-verify-otp"),
    path("login/resend-otp/", ResendLoginOTPView.as_view(), name="login-resend-otp"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("logout/", LogoutView.as_view(), name="logout"),

    # Forgot Password
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),

    # Address management
    path("addresses/", AddressListCreateView.as_view(), name="address-list-create"),
    path("addresses/<int:pk>/", AddressDetailView.as_view(), name="address-detail"),

    # Admin user management
    path("admin/users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("admin/users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
]
