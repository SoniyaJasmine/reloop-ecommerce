
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from .serializers import ProductSubmissionSerializer


class ProductSubmissionView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = ProductSubmissionSerializer(
            data=request.data
        )

        if serializer.is_valid():
            user = (
                request.user
                if request.user.is_authenticated
                else None
            )

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
