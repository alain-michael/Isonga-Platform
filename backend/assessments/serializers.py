from rest_framework import serializers
from .models import *

class AssessmentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentCategory
        fields = '__all__'

class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = '__all__'

class QuestionnaireSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Questionnaire
        fields = '__all__'

class AssessmentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentResponse
        fields = '__all__'

class CategoryScoreSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = CategoryScore
        fields = '__all__'

class RecommendationSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Recommendation
        fields = '__all__'

class AssessmentSerializer(serializers.ModelSerializer):
    enterprise_name = serializers.CharField(source='enterprise.business_name', read_only=True)
    questionnaire_title = serializers.CharField(source='questionnaire.title', read_only=True)
    responses = AssessmentResponseSerializer(many=True, read_only=True)
    category_scores = CategoryScoreSerializer(many=True, read_only=True)
    recommendations = RecommendationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Assessment
        fields = '__all__'
        read_only_fields = ['total_score', 'max_possible_score', 'percentage_score']

class AssessmentListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing assessments"""
    enterprise_name = serializers.CharField(source='enterprise.business_name', read_only=True)
    questionnaire_title = serializers.CharField(source='questionnaire.title', read_only=True)
    
    class Meta:
        model = Assessment
        fields = ['id', 'enterprise_name', 'questionnaire_title', 'fiscal_year', 'status', 'percentage_score', 'created_at']
