from django.urls import path
from . import views

urlpatterns = [
    path('api/dashboard-stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('api/recent-assessments/', views.RecentAssessmentsView.as_view(), name='recent-assessments'),
    path('api/recent-enterprises/', views.RecentEnterprisesView.as_view(), name='recent-enterprises'),
    path('api/system-metrics/', views.SystemMetricsView.as_view(), name='system-metrics'),
]
