from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Enterprise, EnterpriseDocument
from assessments.models import Assessment

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class AssessmentSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for assessments in enterprise detail"""
    questionnaire_title = serializers.CharField(source='questionnaire.title', read_only=True)
    
    class Meta:
        model = Assessment
        fields = ['id', 'questionnaire', 'questionnaire_title', 'fiscal_year', 'status', 
                  'percentage_score', 'completed_at', 'created_at']
        read_only_fields = ['id', 'questionnaire_title', 'percentage_score', 'completed_at', 'created_at']

class EnterpriseDocumentSerializer(serializers.ModelSerializer):
    verified_by_name = serializers.CharField(source='verified_by.get_full_name', read_only=True)
    
    class Meta:
        model = EnterpriseDocument
        fields = '__all__'
        read_only_fields = ['enterprise', 'verified_by', 'verified_at', 'uploaded_at']

class EnterpriseDetailSerializer(serializers.ModelSerializer):
    """Comprehensive serializer for enterprise detail view"""
    user = UserSerializer(read_only=True)
    documents = EnterpriseDocumentSerializer(many=True, read_only=True)
    assessments = AssessmentSummarySerializer(many=True, read_only=True)
    vetted_by_name = serializers.CharField(source='vetted_by.get_full_name', read_only=True)
    
    # Document statistics
    total_documents = serializers.SerializerMethodField()
    verified_documents = serializers.SerializerMethodField()
    pending_documents = serializers.SerializerMethodField()
    verification_status_display = serializers.CharField(source='get_verification_status_display', read_only=True)
    
    class Meta:
        model = Enterprise
        fields = '__all__'
        read_only_fields = ['user', 'is_vetted', 'vetted_by', 'vetted_at', 'created_at', 'updated_at']
    
    def get_total_documents(self, obj):
        return obj.documents.count()
    
    def get_verified_documents(self, obj):
        return obj.documents.filter(is_verified=True).count()
    
    def get_pending_documents(self, obj):
        return obj.documents.filter(is_verified=False).count()

class EnterpriseListSerializer(serializers.ModelSerializer):
    """Enhanced serializer for listing enterprises with key info"""
    user = UserSerializer(read_only=True)
    vetted_by_name = serializers.CharField(source='vetted_by.get_full_name', read_only=True)
    verification_status_display = serializers.CharField(source='get_verification_status_display', read_only=True)
    
    # Document statistics
    total_documents = serializers.SerializerMethodField()
    verified_documents = serializers.SerializerMethodField()
    
    # Additional computed fields
    phone_number = serializers.CharField(source='phone', read_only=True)  # For frontend compatibility
    enterprise_size_display = serializers.CharField(source='get_enterprise_size_display', read_only=True)
    sector_display = serializers.CharField(source='get_sector_display', read_only=True)
    
    class Meta:
        model = Enterprise
        fields = [
            'id', 'business_name', 'tin_number', 'registration_number', 'enterprise_type', 
            'enterprise_size', 'enterprise_size_display', 'sector', 'sector_display',
            'address', 'city', 'district', 'phone', 'phone_number', 'email', 'website',
            'year_established', 'number_of_employees', 'annual_revenue', 'description',
            'verification_status', 'verification_status_display', 'is_vetted', 'vetted_by', 
            'vetted_by_name', 'vetted_at', 'verification_notes', 'documents_requested',
            'total_documents', 'verified_documents', 'user', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'is_vetted', 'vetted_by', 'vetted_at', 'created_at', 'updated_at']
    
    def get_total_documents(self, obj):
        return obj.documents.count()
    
    def get_verified_documents(self, obj):
        return obj.documents.filter(is_verified=True).count()

class EnterpriseSerializer(EnterpriseDetailSerializer):
    """Main serializer - uses detail serializer"""
    pass
