from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EnterpriseViewSet, EnterpriseDocumentViewSet,
    BusinessProfileFormViewSet, EnterpriseProfileFormResponseViewSet,
)

router = DefaultRouter()
router.register(r'enterprises', EnterpriseViewSet)
router.register(r'documents', EnterpriseDocumentViewSet)
router.register(r'profile-forms', BusinessProfileFormViewSet, basename='profile-forms')
router.register(r'profile-responses', EnterpriseProfileFormResponseViewSet, basename='profile-responses')

urlpatterns = [
    path('api/', include(router.urls)),
]
