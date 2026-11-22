from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import TestCase, override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="RELOOP Support <support@reloop.com>",
    FRONTEND_URL="http://localhost:5173",
)
class ForgotResetPasswordAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="jane",
            email="jane@example.com",
            password="Oldpass123!",
            first_name="Jane",
        )

    def test_forgot_password_requires_email(self):
        response = self.client.post("/api/accounts/forgot-password/", {}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data.get("error"), "Email is required.")

    def test_forgot_password_existing_user_sends_reset_email(self):
        response = self.client.post(
            "/api/accounts/forgot-password/",
            {"email": "jane@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("password reset link has been sent", response.data.get("message", ""))
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["jane@example.com"])
        self.assertIn("/reset-password/?uid=", mail.outbox[0].body)
        self.assertIn("token=", mail.outbox[0].body)

    def test_forgot_password_nonexistent_email_is_generic_and_sends_nothing(self):
        response = self.client.post(
            "/api/accounts/forgot-password/",
            {"email": "nobody@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("password reset link has been sent", response.data.get("message", ""))
        self.assertEqual(len(mail.outbox), 0)

    def _reset_payload(self, **overrides):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        payload = {
            "uid": uid,
            "token": token,
            "new_password": "Newpass123!",
            "confirm_password": "Newpass123!",
        }
        payload.update(overrides)
        return payload

    def test_reset_password_success(self):
        response = self.client.post(
            "/api/accounts/reset-password/",
            self._reset_payload(),
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("reset successfully", response.data.get("message", "").lower())
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("Newpass123!"))

    def test_reset_password_rejects_mismatched_passwords(self):
        response = self.client.post(
            "/api/accounts/reset-password/",
            self._reset_payload(confirm_password="Different123!"),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data.get("error"), "Passwords do not match.")
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("Oldpass123!"))

    def test_reset_password_rejects_invalid_token(self):
        response = self.client.post(
            "/api/accounts/reset-password/",
            self._reset_payload(token="bad-token"),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data.get("error"), "Invalid or expired reset link.")

    def test_reset_password_rejects_invalid_uid(self):
        response = self.client.post(
            "/api/accounts/reset-password/",
            self._reset_payload(uid="bad"),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data.get("error"), "Invalid or expired reset link.")

    def test_reset_password_validates_password_strength(self):
        response = self.client.post(
            "/api/accounts/reset-password/",
            self._reset_payload(new_password="123", confirm_password="123"),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("Oldpass123!"))
