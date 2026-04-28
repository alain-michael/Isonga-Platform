"""
URL configuration for isonga project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Group all your app APIs together
api_patterns = [
    path('accounts/', include('accounts.urls')),
    path('enterprises/', include('enterprises.urls')),
    path('assessments/', include('assessments.urls')),
    path('payments/', include('payments.urls')),
    path('admin_dashboard/', include('admin_dashboard.urls')),
    path('investors/', include('investors.urls')),
    path('campaigns/', include('campaigns.urls')),
    path('core/', include('core.urls')),
]

urlpatterns = [
    # Keep admin at the root level so /admin/ works
    path('admin/', admin.site.urls),
    
    # Mount all the app URLs under the /api/ prefix
    path('api/', include(api_patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)