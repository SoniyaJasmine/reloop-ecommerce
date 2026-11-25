
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Address, LoginOTP, UserProfile
from .serializers import (
    AddressSerializer,
    AdminUserSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)
from .utils import (
    create_session_token,
    generate_otp_code,
    get_registered_mobile_number,
    hash_otp,
    mask_phone_number,
    otp_expiry_time,
    otp_max_attempts,
    otp_resend_cooldown_seconds,
    send_otp_sms,
    verify_otp_hash,
)

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

def _get_active_login_otp(session_token, user=None):
    if not session_token:
        return None
    qs = LoginOTP.objects.select_related("user")
    if user is not None:
        qs = qs.filter(user=user)
    return qs.filter(session_token=session_token, is_verified=False).order_by("-created_at").first()


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        password = request.data.get("password") or ""

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {"error": "Enter a valid email address."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_record = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = authenticate(
            request,
            username=user_record.username,
            password=password,
        )

        if user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"error": "This account is inactive."},
                status=status.HTTP_403_FORBIDDEN,
            )

        UserProfile.objects.get_or_create(user=user)
        mobile_number = get_registered_mobile_number(user)
        if not mobile_number:
            return Response(
                {
                    "error": "No registered mobile number was found for this account. Please add a mobile number to your profile or default address before logging in."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp_code = generate_otp_code()
        session_token = create_session_token()
        expires_at = otp_expiry_time()
        max_attempts = otp_max_attempts()

        with transaction.atomic():
            LoginOTP.objects.filter(user=user, is_verified=False).update(
                expires_at=timezone.now(),
                is_verified=False,
            )
            LoginOTP.objects.create(
                user=user,
                otp_hash=hash_otp(otp_code),
                mobile_number=mobile_number,
                expires_at=expires_at,
                attempts=0,
                max_attempts=max_attempts,
                resend_count=0,
                last_sent_at=timezone.now(),
                is_verified=False,
                session_token=session_token,
            )

        sent = send_otp_sms(mobile_number, otp_code)
        if not sent:
            return Response(
                {
                    "error": "Unable to send OTP to your registered mobile number. Please try again later."
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {
                "message": "OTP sent to your registered mobile number.",
                "otp_required": True,
                "session_token": session_token,
                "masked_mobile": mask_phone_number(mobile_number),
                "expires_in_seconds": int((expires_at - timezone.now()).total_seconds()),
                "resend_cooldown_seconds": otp_resend_cooldown_seconds(),
            },
            status=status.HTTP_200_OK,
        )


class VerifyLoginOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        session_token = (request.data.get("session_token") or "").strip()
        otp = (request.data.get("otp") or "").strip()

        if not session_token or not otp:
            return Response(
                {"error": "Session token and OTP are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not otp.isdigit() or len(otp) not in (4, 6):
            return Response(
                {"error": "Enter a valid OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            otp_record = _get_active_login_otp(session_token)
            if not otp_record:
                return Response(
                    {"error": "Invalid or expired OTP session. Please log in again."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            otp_record = LoginOTP.objects.select_for_update().select_related("user").get(
                pk=otp_record.pk
            )
            user = otp_record.user

            if otp_record.is_verified:
                return Response(
                    {"error": "This OTP has already been used. Please log in again."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if otp_record.is_expired:
                return Response(
                    {"error": "OTP has expired. Please request a new OTP."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if otp_record.attempts >= otp_record.max_attempts:
                return Response(
                    {"error": "Maximum OTP attempts exceeded. Please log in again."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

            if not verify_otp_hash(otp, otp_record.otp_hash):
                otp_record.attempts += 1
                otp_record.save(update_fields=["attempts"])
                remaining = max(otp_record.max_attempts - otp_record.attempts, 0)
                return Response(
                    {
                        "error": "Invalid OTP. Please try again.",
                        "remaining_attempts": remaining,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not user.is_active:
                return Response(
                    {"error": "This account is inactive."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            otp_record.is_verified = True
            otp_record.save(update_fields=["is_verified"])
            LoginOTP.objects.filter(user=user, is_verified=False).exclude(pk=otp_record.pk).update(
                expires_at=timezone.now()
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "Login successful.",
                "user": UserProfileSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )


class ResendLoginOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        session_token = (request.data.get("session_token") or "").strip()
        if not session_token:
            return Response(
                {"error": "Session token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            otp_record = _get_active_login_otp(session_token)
            if not otp_record:
                return Response(
                    {"error": "Invalid or expired OTP session. Please log in again."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            otp_record = LoginOTP.objects.select_for_update().select_related("user").get(
                pk=otp_record.pk
            )

            if otp_record.is_expired:
                return Response(
                    {"error": "OTP session has expired. Please log in again."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            cooldown = otp_resend_cooldown_seconds()
            elapsed = (timezone.now() - otp_record.last_sent_at).total_seconds()
            if elapsed < cooldown:
                return Response(
                    {
                        "error": "Please wait before requesting another OTP.",
                        "retry_after_seconds": int(cooldown - elapsed) + 1,
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

            otp_code = generate_otp_code()
            otp_record.otp_hash = hash_otp(otp_code)
            otp_record.expires_at = otp_expiry_time()
            otp_record.attempts = 0
            otp_record.resend_count += 1
            otp_record.last_sent_at = timezone.now()
            otp_record.save(
                update_fields=[
                    "otp_hash",
                    "expires_at",
                    "attempts",
                    "resend_count",
                    "last_sent_at",
                ]
            )

        sent = send_otp_sms(otp_record.mobile_number, otp_code)
        if not sent:
            return Response(
                {"error": "Unable to resend OTP. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {
                "message": "A new OTP has been sent to your registered mobile number.",
                "masked_mobile": mask_phone_number(otp_record.mobile_number),
                "expires_in_seconds": int((otp_record.expires_at - timezone.now()).total_seconds()),
                "resend_cooldown_seconds": otp_resend_cooldown_seconds(),
            },
            status=status.HTTP_200_OK,
        )

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