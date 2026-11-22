
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    AddressSerializer,
    AdminUserSerializer,
)
from .models import Address

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Account created successfully.",
                "user": UserProfileSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        if not email or not password:
            return Response({
                "error": "Email and password are required."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_record = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({
                "error": "Invalid email or password."
            }, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(
            request,
            username=user_record.username,
            password=password
        )

        if user is None:
            return Response({
                "error": "Invalid email or password."
            }, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({
                "error": "This account is inactive."
            }, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Login successful.",
            "user": UserProfileSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_200_OK)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = User.objects.all().order_by("-date_joined")
        search = (request.query_params.get("search") or "").strip()
        if search:
            qs = qs.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )

        is_active = request.query_params.get("is_active")
        if is_active is not None and is_active != "":
            val = str(is_active).lower()
            if val in ("true", "1", "yes"):
                qs = qs.filter(is_active=True)
            elif val in ("false", "0", "no"):
                qs = qs.filter(is_active=False)

        is_staff = request.query_params.get("is_staff")
        if is_staff is not None and is_staff != "":
            val = str(is_staff).lower()
            if val in ("true", "1", "yes"):
                qs = qs.filter(is_staff=True)
            elif val in ("false", "0", "no"):
                qs = qs.filter(is_staff=False)

        serializer = AdminUserSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(AdminUserSerializer(user).data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Prevent admins from locking themselves out accidentally
        if user.id == request.user.id and request.data.get("is_active") is False:
            return Response(
                {"error": "You cannot deactivate your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Only allow activation status changes through this endpoint
        data = {}
        if "is_active" in request.data:
            data["is_active"] = request.data.get("is_active")

        if not data:
            return Response(
                {"error": "No valid fields provided. Only is_active can be updated."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AdminUserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response({
                "error": "Refresh token is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)

            if str(token["user_id"]) != str(request.user.id):
                return Response({
                    "error": "Invalid refresh token."
                }, status=status.HTTP_400_BAD_REQUEST)

            token.blacklist()

            return Response({
                "message": "Logged out successfully."
            }, status=status.HTTP_200_OK)

        except TokenError:
            return Response({
                "error": "Invalid or expired refresh token."
            }, status=status.HTTP_400_BAD_REQUEST)

# FORGOT PASSWORD

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email:
            return Response({
                "error": "Email is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(
            email__iexact=email,
            is_active=True
        ).first()

        # Always return the same message to avoid revealing
        # whether an email address has an account.
        message = (
            "If an account exists with this email, "
            "a password reset link has been sent."
        )

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_link = (
                f"{settings.FRONTEND_URL}/reset-password/"
                f"?uid={uid}&token={token}"
            )

            subject = "Reset Your RELOOP Password"

            email_message = f"""
Hello {user.first_name or user.username},

We received a request to reset your RELOOP account password.

Click the link below to create a new password:

{reset_link}

If you did not request this, you can safely ignore this email.

Regards,
RELOOP Support
"""

            send_mail(
                subject,
                email_message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )

        return Response({
            "message": message
        }, status=status.HTTP_200_OK)

# RESET PASSWORD

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not all([uid, token, new_password, confirm_password]):
            return Response({
                "error": "All fields are required."
            }, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({
                "error": "Passwords do not match."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                "error": "Invalid or expired reset link."
            }, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({
                "error": "Invalid or expired reset link."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except Exception as error:
            from django.core.exceptions import ValidationError

            if isinstance(error, ValidationError):
                return Response({
                    "error": list(error.messages)
                }, status=status.HTTP_400_BAD_REQUEST)
            raise

        user.set_password(new_password)
        user.save()

        return Response({
            "message": "Your password has been reset successfully. Please log in."
        }, status=status.HTTP_200_OK)


class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            user_addresses = Address.objects.filter(user=request.user)
            # If this is the user's first address, make it default unless explicitly false
            if not user_addresses.exists() and "is_default" not in request.data:
                serializer.save(user=request.user, is_default=True)
            else:
                # If explicitly setting default, model save will unset others.
                # If no default exists at all, ensure one remains default.
                address = serializer.save(user=request.user)
                if not Address.objects.filter(user=request.user, is_default=True).exists():
                    address.is_default = True
                    address.save(update_fields=["is_default"])
                return Response(AddressSerializer(address).data, status=status.HTTP_201_CREATED)

            # first address branch saved above
            address = Address.objects.filter(user=request.user).order_by("-id").first()
            return Response(AddressSerializer(address).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        try:
            return Address.objects.get(pk=pk, user=request.user)
        except Address.DoesNotExist:
            return None

    def get(self, request, pk):
        address = self.get_object(request, pk)
        if not address:
            return Response({"error": "Address not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(AddressSerializer(address).data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        address = self.get_object(request, pk)
        if not address:
            return Response({"error": "Address not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AddressSerializer(address, data=request.data)
        if serializer.is_valid():
            updated = serializer.save()
            if not Address.objects.filter(user=request.user, is_default=True).exists():
                updated.is_default = True
                updated.save(update_fields=["is_default"])
            return Response(AddressSerializer(updated).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        address = self.get_object(request, pk)
        if not address:
            return Response({"error": "Address not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            if not Address.objects.filter(user=request.user, is_default=True).exists():
                updated.is_default = True
                updated.save(update_fields=["is_default"])
            return Response(AddressSerializer(updated).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        address = self.get_object(request, pk)
        if not address:
            return Response({"error": "Address not found."}, status=status.HTTP_404_NOT_FOUND)

        was_default = address.is_default
        address.delete()

        if was_default:
            replacement = Address.objects.filter(user=request.user).order_by("-updated_at", "-id").first()
            if replacement:
                replacement.is_default = True
                replacement.save(update_fields=["is_default"])

        return Response({"message": "Address deleted successfully."}, status=status.HTTP_200_OK)