
import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from .serializers import ProductSubmissionSerializer

logger = logging.getLogger(__name__)


class ProductSubmissionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = ProductSubmissionSerializer(data=request.data)

            if serializer.is_valid():
                user = request.user if request.user.is_authenticated else None
                submission = serializer.save(user=user)

                return Response(
                    {
                        "message": "Your product has been submitted successfully!",
                        "submission_id": submission.id,
                        "status": submission.status,
                    },
                    status=status.HTTP_201_CREATED,
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception:
            logger.exception("RELOOP PRODUCT SUBMISSION FAILED")
            return Response(
                {"error": "Product submission failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
