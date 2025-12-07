from rest_framework import viewsets, permissions, status, serializers as drf_serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import *
from .serializers import *
from enterprises.models import Enterprise
from .ai_utils import generate_assessment_insights

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
    def save_responses(self, request, pk=None):
        """Bulk save responses for an assessment"""
        assessment = get_object_or_404(Assessment, pk=pk)
        responses_data = request.data.get('responses', [])
        
        if not responses_data:
            return Response({'error': 'No responses provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Start the assessment if it's still in draft
        if assessment.status == 'draft':
            assessment.status = 'in_progress'
            assessment.started_at = timezone.now()
            assessment.save()
        
        saved_responses = []
        for response_data in responses_data:
            question_id = response_data.get('question')
            value = response_data.get('value')
            
            if not question_id:
                continue
            
            # Get or create response
            response, created = AssessmentResponse.objects.get_or_create(
                assessment=assessment,
                question_id=question_id,
                defaults={'score': 0}
            )
            
            # Handle different question types
            question = response.question
            
            if question.question_type in ['single_choice', 'multiple_choice']:
                # Clear existing selections
                response.selected_options.clear()
                # Add new selections
                if isinstance(value, list):
                    response.selected_options.set(value)
                elif value:
                    response.selected_options.add(value)
                # Calculate score from selected options
                response.score = sum(opt.score for opt in response.selected_options.all())
            elif question.question_type == 'number':
                response.number_response = value
                response.score = float(value) if value else 0
            elif question.question_type == 'scale':
                response.number_response = value
                # Scale score is proportional (value/10 * max_score)
                response.score = (float(value) / 10) * question.max_score if value else 0
            else:  # text, file_upload
                response.text_response = value
                response.score = 0  # Manual scoring needed
            
            response.save()
            saved_responses.append(response)
        
        return Response({
            'message': f'Saved {len(saved_responses)} responses successfully',
            'count': len(saved_responses)
        })
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit an assessment for review"""
        assessment = get_object_or_404(Assessment, pk=pk)
        
        # Allow submission from draft or in_progress
        if assessment.status not in ['draft', 'in_progress']:
            return Response({'error': 'Assessment already completed'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save any responses provided with submission
        responses_data = request.data.get('responses', [])
        if responses_data:
            # Reuse the save_responses logic
            self.save_responses(request, pk)
        
        # Calculate scores
        self._calculate_assessment_scores(assessment)
        
        assessment.status = 'completed'
        assessment.completed_at = timezone.now()
        assessment.save()
        
        # Generate AI-powered insights and recommendations
        try:
            self._generate_ai_insights(assessment)
        except Exception as e:
            # Log error but don't fail submission
            print(f"Warning: Failed to generate AI insights: {str(e)}")
            # Fall back to basic recommendations
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
    
    @action(detail=True, methods=['post'])
    def generate_insights(self, request, pk=None):
        """Generate or regenerate AI insights for an assessment"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        assessment = get_object_or_404(Assessment, pk=pk)
        
        if assessment.status not in ['completed', 'reviewed']:
            return Response(
                {'error': 'Assessment must be completed before generating insights'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            self._generate_ai_insights(assessment)
            return Response({'message': 'AI insights generated successfully'})
        except Exception as e:
            return Response(
                {'error': f'Failed to generate insights: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['patch'])
    def update_insights(self, request, pk=None):
        """Admin action to manually update AI-generated insights"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        assessment = get_object_or_404(Assessment, pk=pk)
        
        # Update strengths if provided
        if 'ai_strengths' in request.data:
            assessment.ai_strengths = request.data['ai_strengths']
        
        # Update weaknesses if provided
        if 'ai_weaknesses' in request.data:
            assessment.ai_weaknesses = request.data['ai_weaknesses']
        
        assessment.save()
        
        return Response({'message': 'Insights updated successfully'})
    
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
    
    def _generate_ai_insights(self, assessment):
        """Generate AI-powered insights using Gemini"""
        try:
            # Generate insights using Gemini AI
            insights = generate_assessment_insights(assessment, assessment.enterprise)
            
            # Store strengths and weaknesses
            assessment.ai_strengths = insights.get('strengths', [])
            assessment.ai_weaknesses = insights.get('weaknesses', [])
            assessment.ai_generated_at = timezone.now()
            assessment.save()
            
            # Clear existing recommendations
            assessment.recommendations.all().delete()
            
            # Create recommendations from AI insights
            for rec_data in insights.get('recommendations', []):
                # Find the category by name, or use a default
                category = None
                if 'category' in rec_data:
                    category = AssessmentCategory.objects.filter(
                        name__icontains=rec_data['category']
                    ).first()
                
                # If no category found, try to match from category scores
                if not category:
                    category_scores = assessment.category_scores.all()
                    if category_scores:
                        category = category_scores[0].category
                
                Recommendation.objects.create(
                    assessment=assessment,
                    category=category,
                    title=rec_data.get('title', 'Recommendation'),
                    description=rec_data.get('description', ''),
                    priority=rec_data.get('priority', 'medium'),
                    suggested_actions=rec_data.get('suggested_actions', '')
                )
        except Exception as e:
            print(f"Error generating AI insights: {str(e)}")
            raise
    
    def _generate_recommendations(self, assessment):
        """Generate basic recommendations based on assessment scores (fallback)"""
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
