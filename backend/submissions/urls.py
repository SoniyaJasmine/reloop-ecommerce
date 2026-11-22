
from django.urls import path
from .views import ProductSubmissionView

urlpatterns = [
    path(
        "",
        ProductSubmissionView.as_view(),
        name="product-submission",
    ),
]
