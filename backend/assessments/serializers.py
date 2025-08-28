from rest_framework import serializers
from .models import *
from enterprises.models import Enterprise
from accounts.models import User

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

# Nested serializers for the frontend interface
class EnterpriseNestedSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source='phone', read_only=True)
    
    class Meta:
        model = Enterprise
        fields = ['id', 'business_name', 'sector', 'tin_number', 'district', 'number_of_employees', 'email', 'phone_number']

class ReviewerNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name']

class QuestionnaireCategoryNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentCategory
        fields = ['name']

class QuestionnaireNestedSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    
    def get_category(self, obj):
        # Get category from the first question of this questionnaire
        first_question = obj.questions.first()
        if first_question and first_question.category:
            return {'name': first_question.category.name}
        return {'name': 'General'}
    
    class Meta:
        model = Questionnaire
        fields = ['id', 'title', 'category']

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
    """Serializer for listing assessments with full nested objects for frontend"""
    title = serializers.CharField(source='questionnaire.title', read_only=True)
    enterprise = EnterpriseNestedSerializer(read_only=True)
    questionnaire = QuestionnaireNestedSerializer(read_only=True)
    reviewer = ReviewerNestedSerializer(source='reviewed_by', read_only=True)
    score = serializers.DecimalField(source='percentage_score', max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = Assessment
        fields = ['id', 'title', 'enterprise', 'questionnaire', 'status', 'score', 'reviewer', 'created_at', 'updated_at']
