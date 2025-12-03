from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet, NotificationViewSet, UserPreferencesViewSet, DeletionRequestViewSet

router = DefaultRouter()
router.register(r'audit-logs', AuditLogViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'preferences', UserPreferencesViewSet)
router.register(r'deletion-requests', DeletionRequestViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
