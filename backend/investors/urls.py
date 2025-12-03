from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InvestorViewSet, InvestorCriteriaViewSet, MatchViewSet, 
    MatchInteractionViewSet, InvestorMatchesView, InteractWithOpportunityView
)

router = DefaultRouter()
router.register(r'profiles', InvestorViewSet)
router.register(r'criteria', InvestorCriteriaViewSet)
router.register(r'matches', MatchViewSet)
router.register(r'interactions', MatchInteractionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('opportunities/', InvestorMatchesView.as_view(), name='investor-opportunities'),
    path('opportunities/<int:pk>/interact/', InteractWithOpportunityView.as_view(), name='investor-opportunity-interact'),
]
