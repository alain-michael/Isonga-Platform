from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Enterprise, EnterpriseDocument,
    BusinessProfileForm, BusinessProfileSection, BusinessProfileField,
    EnterpriseProfileFormResponse,
)
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
    management_structure_display = serializers.CharField(source='get_management_structure_display', read_only=True)
    province_display = serializers.CharField(source='get_province_display', read_only=True)
    sector_display = serializers.CharField(source='get_sector_display', read_only=True)
    
    class Meta:
        model = Enterprise
        fields = [
            'id', 'business_name', 'tin_number', 'registration_number', 'enterprise_type', 
            'management_structure', 'management_structure_display', 'sector', 'sector_display',
            'province', 'province_display', 'district', 'phone', 'phone_number', 'email', 'website',
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


# ─── Business Profile Form serializers ────────────────────────────────────────

class BusinessProfileFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessProfileField
        fields = [
            'id', 'field_type', 'label', 'help_text', 'placeholder',
            'is_required', 'order', 'min_value', 'max_value',
            'choices', 'accepted_file_types', 'max_file_size_mb',
            'auto_fill_source',
        ]


class BusinessProfileSectionSerializer(serializers.ModelSerializer):
    fields = BusinessProfileFieldSerializer(many=True, read_only=True)

    class Meta:
        model = BusinessProfileSection
        fields = ['id', 'title', 'description', 'order', 'fields']


class BusinessProfileFormSerializer(serializers.ModelSerializer):
    """Read/write serializer for listing / basic CRUD."""
    sections = BusinessProfileSectionSerializer(many=True, read_only=True)
    sector_display = serializers.CharField(source='get_sector_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = BusinessProfileForm
        fields = [
            'id', 'sector', 'sector_display', 'name', 'description',
            'is_active', 'sections', 'created_by', 'created_by_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class BusinessProfileFormDetailSerializer(serializers.ModelSerializer):
    """Used when saving a full form (sections + fields) in one request."""
    sections_data = BusinessProfileSectionSerializer(many=True, read_only=True, source='sections')
    # Write: accept nested sections payload
    sections = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    sector_display = serializers.CharField(source='get_sector_display', read_only=True)

    class Meta:
        model = BusinessProfileForm
        fields = [
            'id', 'sector', 'sector_display', 'name', 'description',
            'is_active', 'sections', 'sections_data',
            'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def _save_sections(self, form, sections_data):
        # Delete existing sections to do a full replace
        form.sections.all().delete()
        for s_idx, section in enumerate(sections_data):
            sec_obj = BusinessProfileSection.objects.create(
                form=form,
                title=section.get('title', ''),
                description=section.get('description', ''),
                order=section.get('order', s_idx),
            )
            for f_idx, field in enumerate(section.get('fields', [])):
                BusinessProfileField.objects.create(
                    section=sec_obj,
                    field_type=field.get('field_type', 'text'),
                    label=field.get('label', ''),
                    help_text=field.get('help_text', ''),
                    placeholder=field.get('placeholder', ''),
                    is_required=field.get('is_required', True),
                    order=field.get('order', f_idx),
                    min_value=field.get('min_value'),
                    max_value=field.get('max_value'),
                    choices=field.get('choices', []),
                    accepted_file_types=field.get('accepted_file_types', []),
                    max_file_size_mb=field.get('max_file_size_mb'),
                    auto_fill_source=field.get('auto_fill_source', ''),
                )

    def create(self, validated_data):
        sections_data = validated_data.pop('sections', [])
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        form = BusinessProfileForm.objects.create(**validated_data)
        self._save_sections(form, sections_data)
        return form

    def update(self, instance, validated_data):
        sections_data = validated_data.pop('sections', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if sections_data is not None:
            self._save_sections(instance, sections_data)
        return instance


class EnterpriseProfileFormResponseSerializer(serializers.ModelSerializer):
    """Stores / retrieves an enterprise's profile form answers."""
    form_structure = BusinessProfileFormSerializer(source='form', read_only=True)

    class Meta:
        model = EnterpriseProfileFormResponse
        fields = ['id', 'enterprise', 'form', 'form_structure', 'responses', 'submitted_at', 'updated_at']
        read_only_fields = ['enterprise', 'submitted_at', 'updated_at']
