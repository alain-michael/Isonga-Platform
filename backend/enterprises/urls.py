from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnterpriseViewSet, EnterpriseDocumentViewSet

router = DefaultRouter()
router.register(r'enterprises', EnterpriseViewSet)
router.register(r'documents', EnterpriseDocumentViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
