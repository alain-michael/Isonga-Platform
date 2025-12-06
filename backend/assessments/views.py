from rest_framework import viewsets, permissions, status, serializers as drf_serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import *
from .serializers import *
from enterprises.models import Enterprise

class AssessmentCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AssessmentCategory.objects.filter(is_active=True)
    serializer_class = AssessmentCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class QuestionnaireViewSet(viewsets.ModelViewSet):
    queryset = Questionnaire.objects.all()
    serializer_class = QuestionnaireSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        questionnaire = serializer.save(created_by=self.request.user)
        # Calculate estimated time after creation if questions exist
        if questionnaire.questions.exists():
            questionnaire.calculate_estimated_time()
    
    def get_queryset(self):
        user = self.request.user
        queryset = Questionnaire.objects.all() if user.user_type in ['admin', 'superadmin'] else Questionnaire.objects.filter(is_active=True)
        
        # Filter by enterprise criteria if enterprise user
        if user.user_type == 'enterprise':
            try:
                enterprise = user.enterprise
                # Filter questionnaires that match this enterprise
                matching_questionnaires = [
                    q.id for q in queryset if q.matches_enterprise(enterprise)
                ]
                queryset = queryset.filter(id__in=matching_questionnaires)
            except Enterprise.DoesNotExist:
                pass
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def calculate_time(self, request, pk=None):
        """Recalculate estimated time for a questionnaire"""
        questionnaire = self.get_object()
        estimated_time = questionnaire.calculate_estimated_time()
        return Response({'estimated_time_minutes': estimated_time})

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AssessmentListSerializer
        return AssessmentSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'enterprise':
            try:
                enterprise = user.enterprise
                return Assessment.objects.filter(enterprise=enterprise)
            except Enterprise.DoesNotExist:
                return Assessment.objects.none()
        elif user.user_type in ['admin', 'superadmin']:
            return Assessment.objects.all()
        return Assessment.objects.none()
    
    def perform_create(self, serializer):
        # Get current fiscal year (assuming fiscal year follows calendar year)
        # In Rwanda, fiscal year is July 1 - June 30
        current_date = timezone.now()
        if current_date.month >= 7:
            fiscal_year = current_date.year
        else:
            fiscal_year = current_date.year - 1
        
        if self.request.user.user_type == 'enterprise':
            try:
                enterprise = self.request.user.enterprise
            except Enterprise.DoesNotExist:
                raise drf_serializers.ValidationError({
                    'enterprise': 'You must have an enterprise profile to create assessments.'
                })
            serializer.save(enterprise=enterprise, fiscal_year=fiscal_year)
        else:
            # For admin, allow specifying enterprise but still auto-set fiscal year if not provided
            if 'fiscal_year' not in serializer.validated_data:
                serializer.save(fiscal_year=fiscal_year)
            else:
                serializer.save()
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start an assessment"""
        assessment = get_object_or_404(Assessment, pk=pk)
        
        if assessment.status != 'draft':
            return Response({'error': 'Assessment already started'}, status=status.HTTP_400_BAD_REQUEST)
        
        assessment.status = 'in_progress'
        assessment.started_at = timezone.now()
        assessment.save()
        
        return Response({'message': 'Assessment started successfully'})
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit an assessment for review"""
        assessment = get_object_or_404(Assessment, pk=pk)
        
        if assessment.status != 'in_progress':
            return Response({'error': 'Assessment not in progress'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate scores
        self._calculate_assessment_scores(assessment)
        
        assessment.status = 'completed'
        assessment.completed_at = timezone.now()
        assessment.save()
        
        # Generate recommendations
        self._generate_recommendations(assessment)
        
        return Response({'message': 'Assessment submitted successfully'})
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Admin action to review an assessment"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        assessment = get_object_or_404(Assessment, pk=pk)
        assessment.status = 'reviewed'
        assessment.reviewed_at = timezone.now()
        assessment.reviewed_by = request.user
        assessment.save()
        
        return Response({'message': 'Assessment reviewed successfully'})
    
    def _calculate_assessment_scores(self, assessment):
        """Calculate scores for an assessment"""
        total_score = 0
        max_possible_score = 0
        
        # Calculate category scores
        categories = AssessmentCategory.objects.filter(is_active=True)
        for category in categories:
            category_score = 0
            category_max_score = 0
            
            responses = assessment.responses.filter(question__category=category)
            for response in responses:
                category_score += response.score
                category_max_score += response.question.max_score
            
            if category_max_score > 0:
                category_percentage = (category_score / category_max_score) * 100
                
                CategoryScore.objects.update_or_create(
                    assessment=assessment,
                    category=category,
                    defaults={
                        'score': category_score,
                        'max_score': category_max_score,
                        'percentage': category_percentage
                    }
                )
                
                # Weight the scores
                weighted_score = category_score * category.weight
                weighted_max_score = category_max_score * category.weight
                
                total_score += weighted_score
                max_possible_score += weighted_max_score
        
        if max_possible_score > 0:
            percentage_score = (total_score / max_possible_score) * 100
        else:
            percentage_score = 0
        
        assessment.total_score = total_score
        assessment.max_possible_score = max_possible_score
        assessment.percentage_score = percentage_score
        assessment.save()
    
    def _generate_recommendations(self, assessment):
        """Generate recommendations based on assessment scores"""
        category_scores = assessment.category_scores.all()
        
        for category_score in category_scores:
            if category_score.percentage < 50:  # Low score threshold
                priority = 'high'
                title = f"Improve {category_score.category.name}"
                description = f"Your score in {category_score.category.name} is {category_score.percentage:.1f}%, which is below the recommended threshold."
                actions = f"Focus on improving practices related to {category_score.category.name.lower()}."
            elif category_score.percentage < 75:  # Medium score threshold
                priority = 'medium'
                title = f"Enhance {category_score.category.name}"
                description = f"Your score in {category_score.category.name} is {category_score.percentage:.1f}%, which has room for improvement."
                actions = f"Consider implementing best practices in {category_score.category.name.lower()}."
            else:
                priority = 'low'
                title = f"Maintain {category_score.category.name} Excellence"
                description = f"Your score in {category_score.category.name} is excellent at {category_score.percentage:.1f}%."
                actions = f"Continue current practices in {category_score.category.name.lower()}."
            
            Recommendation.objects.create(
                assessment=assessment,
                category=category_score.category,
                title=title,
                description=description,
                priority=priority,
                suggested_actions=actions
            )

class AssessmentResponseViewSet(viewsets.ModelViewSet):
    queryset = AssessmentResponse.objects.all()
    serializer_class = AssessmentResponseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'enterprise':
            return AssessmentResponse.objects.filter(assessment__enterprise__user=user)
        elif user.user_type in ['admin', 'superadmin']:
            return AssessmentResponse.objects.all()
        return AssessmentResponse.objects.none()
