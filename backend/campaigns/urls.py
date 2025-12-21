from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampaignViewSet, CampaignDocumentViewSet, CampaignInterestViewSet, CampaignUpdateViewSet, CampaignMessageViewSet

router = DefaultRouter()
router.register(r'campaigns', CampaignViewSet)
router.register(r'documents', CampaignDocumentViewSet)
router.register(r'interests', CampaignInterestViewSet)
router.register(r'updates', CampaignUpdateViewSet)
router.register(r'messages', CampaignMessageViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
