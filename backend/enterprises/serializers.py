from rest_framework import serializers
from .models import Enterprise, EnterpriseDocument

class EnterpriseDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnterpriseDocument
        fields = '__all__'

class EnterpriseSerializer(serializers.ModelSerializer):
    documents = EnterpriseDocumentSerializer(many=True, read_only=True)
    vetted_by_name = serializers.CharField(source='vetted_by.get_full_name', read_only=True)
    
    class Meta:
        model = Enterprise
        fields = '__all__'
        read_only_fields = ['user', 'is_vetted', 'vetted_by', 'vetted_at', 'created_at', 'updated_at']

class EnterpriseListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing enterprises"""
    class Meta:
        model = Enterprise
        fields = ['id', 'business_name', 'tin_number', 'enterprise_type', 'sector', 'is_vetted', 'created_at']
