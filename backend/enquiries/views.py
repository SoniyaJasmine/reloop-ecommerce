from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import EnquirySerializer


class EnquiryCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EnquirySerializer(data=request.data)
        if serializer.is_valid():
            enquiry = serializer.save()
            return Response(
                {
                    "message": "Your enquiry has been submitted successfully. Our team will get back to you soon.",
                    "enquiry_id": enquiry.id,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
