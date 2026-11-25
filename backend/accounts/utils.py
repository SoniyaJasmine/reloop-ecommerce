import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone

logger = logging.getLogger(__name__)


def normalize_phone_number(value):
    digits = "".join(ch for ch in str(value or "") if ch.isdigit())
    return digits


def mask_phone_number(phone_number):
    digits = normalize_phone_number(phone_number)
    if len(digits) <= 4:
        return "*" * len(digits)
    return ("*" * (len(digits) - 4)) + digits[-4:]


def get_registered_mobile_number(user):
    profile = getattr(user, "profile", None)
    if profile and profile.phone_number:
        return normalize_phone_number(profile.phone_number)

    default_address = user.addresses.filter(is_default=True).first()
    if default_address and default_address.phone_number:
        return normalize_phone_number(default_address.phone_number)

    any_address = user.addresses.exclude(phone_number="").first()
    if any_address and any_address.phone_number:
        return normalize_phone_number(any_address.phone_number)

    return ""


def generate_otp_code(length=6):
    start = 10 ** (length - 1)
    end = (10 ** length) - 1
    return str(secrets.randbelow(end - start + 1) + start)


def hash_otp(code):
    return make_password(code)


def verify_otp_hash(code, otp_hash):
    return check_password(str(code or "").strip(), otp_hash)


def otp_expiry_time():
    minutes = int(getattr(settings, "OTP_EXPIRY_MINUTES", 5))
    return timezone.now() + timedelta(minutes=minutes)


def otp_resend_cooldown_seconds():
    return int(getattr(settings, "OTP_RESEND_COOLDOWN_SECONDS", 60))


def otp_max_attempts():
    return int(getattr(settings, "OTP_MAX_ATTEMPTS", 5))


def create_session_token():
    return secrets.token_urlsafe(48)


def send_otp_sms(mobile_number, otp_code):
    """
    Send OTP to the registered mobile number.
    In DEBUG with no SMS provider configured, log to server console only.
    Never expose the OTP in API responses.
    """
    provider = (getattr(settings, "SMS_PROVIDER", "console") or "console").lower()
    masked = mask_phone_number(mobile_number)

    if provider == "console" or getattr(settings, "DEBUG", False):
        logger.warning("RELOOP LOGIN OTP for %s: %s", masked, otp_code)
        return True

    # Generic HTTP SMS provider hook (configurable via env/settings).
    sms_url = getattr(settings, "SMS_API_URL", "")
    sms_api_key = getattr(settings, "SMS_API_KEY", "")
    sms_sender = getattr(settings, "SMS_SENDER_ID", "RELOOP")
    if sms_url and sms_api_key:
        try:
            import requests

            payload = {
                "to": mobile_number,
                "message": f"Your RELOOP login OTP is {otp_code}. It expires in {int(getattr(settings, 'OTP_EXPIRY_MINUTES', 5))} minutes.",
                "sender": sms_sender,
            }
            headers = {"Authorization": f"Bearer {sms_api_key}"}
            response = requests.post(sms_url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            return True
        except Exception:
            logger.exception("Failed to send OTP SMS to %s", masked)
            return False

    logger.error("No SMS provider configured for OTP delivery to %s", masked)
    return False
