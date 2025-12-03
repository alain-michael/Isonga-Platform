from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampaignViewSet, CampaignDocumentViewSet, CampaignInterestViewSet

router = DefaultRouter()
router.register(r'campaigns', CampaignViewSet)
router.register(r'documents', CampaignDocumentViewSet)
router.register(r'interests', CampaignInterestViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
