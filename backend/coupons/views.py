from decimal import Decimal

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Coupon
from .serializers import ApplyCouponSerializer


class ValidateCouponView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ApplyCouponSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code = serializer.validated_data["code"]
        subtotal = serializer.validated_data["subtotal"]

        try:
            coupon = Coupon.objects.get(code__iexact=code)
        except Coupon.DoesNotExist:
            return Response({"error": "Invalid coupon code."}, status=status.HTTP_400_BAD_REQUEST)

        ok, errors, discount = coupon.can_apply_to_amount(subtotal)
        if not ok:
            return Response({"error": errors[0], "errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        discount = Decimal(discount)
        final_total = (Decimal(subtotal) - discount).quantize(Decimal("0.01"))

        return Response(
            {
                "valid": True,
                "code": coupon.code,
                "discount_type": coupon.discount_type,
                "discount_value": str(coupon.discount_value),
                "discount_amount": str(discount),
                "subtotal": str(Decimal(subtotal).quantize(Decimal("0.01"))),
                "final_total": str(final_total),
                "message": "Coupon applied successfully.",
            },
            status=status.HTTP_200_OK,
        )
