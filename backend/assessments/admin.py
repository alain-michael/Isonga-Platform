from django.contrib import admin
from .models import (
    AssessmentCategory, Questionnaire, Question, QuestionOption,
    Assessment, AssessmentResponse, CategoryScore, Recommendation,
    QuestionRecommendation, Service
)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'contact', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']

@admin.register(AssessmentCategory)
class AssessmentCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'weight', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']

class QuestionOptionInline(admin.TabularInline):
    model = QuestionOption
    extra = 1

class QuestionRecommendationInline(admin.TabularInline):
    model = QuestionRecommendation
    extra = 1
    fields = ['min_score', 'max_score', 'recommendation_text']
    verbose_name = "Conditional Recommendation"
    verbose_name_plural = "Conditional Recommendations (shown based on score range)"

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['questionnaire', 'category', 'text', 'question_type', 'order', 'max_score']
    list_filter = ['questionnaire', 'category', 'question_type']
    search_fields = ['text']
    inlines = [QuestionOptionInline, QuestionRecommendationInline]

@admin.register(Questionnaire)
class QuestionnaireAdmin(admin.ModelAdmin):
    list_display = ['title', 'version', 'is_active', 'created_by', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title']

@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ['enterprise', 'questionnaire', 'fiscal_year', 'status', 'percentage_score', 'created_at']
    list_filter = ['status', 'fiscal_year', 'created_at']
    search_fields = ['enterprise__business_name', 'enterprise__tin_number']
    readonly_fields = ['total_score', 'max_possible_score', 'percentage_score']

@admin.register(AssessmentResponse)
class AssessmentResponseAdmin(admin.ModelAdmin):
    list_display = ['assessment', 'question', 'score']
    list_filter = ['assessment__status']

@admin.register(CategoryScore)
class CategoryScoreAdmin(admin.ModelAdmin):
    list_display = ['assessment', 'category', 'percentage']
    list_filter = ['category']

@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ['assessment', 'category', 'title', 'priority']
    list_filter = ['priority', 'category']

@admin.register(QuestionRecommendation)
class QuestionRecommendationAdmin(admin.ModelAdmin):
    list_display = ['question', 'min_score', 'max_score', 'recommendation_preview']
    list_filter = ['question__questionnaire', 'question__category']
    search_fields = ['question__text', 'recommendation_text']
    
    def recommendation_preview(self, obj):
        """Show first 50 chars of recommendation"""
        return obj.recommendation_text[:50] + '...' if len(obj.recommendation_text) > 50 else obj.recommendation_text
    recommendation_preview.short_description = 'Recommendation'
