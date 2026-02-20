from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InvestorViewSet, InvestorCriteriaViewSet, MatchViewSet, 
    MatchInteractionViewSet, InvestorMatchesView, InteractWithOpportunityView,
    InterestedCampaignsView, PartnerFundingFormViewSet, FormSectionViewSet, FormFieldViewSet
)

router = DefaultRouter()
router.register(r'profiles', InvestorViewSet)
router.register(r'criteria', InvestorCriteriaViewSet)
router.register(r'matches', MatchViewSet)
router.register(r'interactions', MatchInteractionViewSet)
router.register(r'funding-forms', PartnerFundingFormViewSet)
router.register(r'form-sections', FormSectionViewSet)
router.register(r'form-fields', FormFieldViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('opportunities/', InvestorMatchesView.as_view(), name='investor-opportunities'),
    path('opportunities/<str:pk>/interact/', InteractWithOpportunityView.as_view(), name='investor-opportunity-interact'),
    path('interested-campaigns/', InterestedCampaignsView.as_view(), name='investor-interested-campaigns'),
]
