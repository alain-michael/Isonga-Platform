from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AssessmentCategoryViewSet, QuestionnaireViewSet, 
    AssessmentViewSet, AssessmentResponseViewSet
)

router = DefaultRouter()
router.register(r'categories', AssessmentCategoryViewSet)
router.register(r'questionnaires', QuestionnaireViewSet)
router.register(r'assessments', AssessmentViewSet)
router.register(r'responses', AssessmentResponseViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
