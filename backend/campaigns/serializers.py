from rest_framework import serializers
from .models import Campaign, CampaignDocument, CampaignInterest, CampaignUpdate, CampaignMessage
from enterprises.models import Enterprise


class CampaignUpdateSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.CharField(source='posted_by.get_full_name', read_only=True)
    
    class Meta:
        model = CampaignUpdate
        fields = '__all__'
        read_only_fields = ['posted_at', 'posted_by']


class CampaignDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CampaignDocument
        fields = '__all__'
        read_only_fields = ['uploaded_at', 'campaign']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


class CampaignInterestSerializer(serializers.ModelSerializer):
    investor_name = serializers.CharField(source='investor.organization_name', read_only=True)
    
    class Meta:
        model = CampaignInterest
        fields = '__all__'
        read_only_fields = ['created_at']


class CampaignSerializer(serializers.ModelSerializer):
    enterprise_name = serializers.CharField(source='enterprise.business_name', read_only=True)
    documents_count = serializers.SerializerMethodField()
    interests_count = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Campaign
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'vetted_by', 'vetted_at']
    
    def get_documents_count(self, obj):
        return obj.documents.count()
    
    def get_interests_count(self, obj):
        return obj.interests.count()
    
    def get_progress_percentage(self, obj):
        if obj.target_amount and obj.target_amount > 0:
            return min(100, (obj.amount_raised / obj.target_amount) * 100)
        return 0


class CampaignDetailSerializer(serializers.ModelSerializer):
    """Detailed campaign serializer with nested documents and interests"""
    enterprise_name = serializers.CharField(source='enterprise.business_name', read_only=True)
    enterprise_sector = serializers.CharField(source='enterprise.sector', read_only=True)
    enterprise_user_id = serializers.IntegerField(source='enterprise.user.id', read_only=True)
    documents = CampaignDocumentSerializer(many=True, read_only=True)
    interests = CampaignInterestSerializer(many=True, read_only=True)
    updates = CampaignUpdateSerializer(many=True, read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Campaign
        fields = '__all__'
    
    def get_progress_percentage(self, obj):
        if obj.target_amount and obj.target_amount > 0:
            return min(100, (obj.amount_raised / obj.target_amount) * 100)
        return 0


class CampaignCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating campaigns"""
    
    class Meta:
        model = Campaign
        fields = ['title', 'description', 'campaign_type', 'target_amount', 
                  'min_investment', 'max_investment', 'start_date', 'end_date',
                  'use_of_funds']
    
    def create(self, validated_data):
        user = self.context['request'].user
        if not hasattr(user, 'enterprise'):
            raise serializers.ValidationError("User must have an enterprise to create a campaign")
        
        validated_data['enterprise'] = user.enterprise
        return super().create(validated_data)


class CampaignMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_type = serializers.SerializerMethodField()
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    
    class Meta:
        model = CampaignMessage
        fields = '__all__'
        read_only_fields = ['created_at', 'sender']
    
    def get_sender_name(self, obj):
        if hasattr(obj.sender, 'enterprise'):
            return obj.sender.enterprise.business_name
        elif hasattr(obj.sender, 'investor_profile'):
            return obj.sender.investor_profile.organization_name
        return obj.sender.get_full_name()
    
    def get_sender_type(self, obj):
        return obj.sender.user_type
