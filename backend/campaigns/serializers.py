from rest_framework import serializers
from .models import Campaign, CampaignDocument, CampaignInterest, CampaignUpdate, CampaignMessage, CampaignPartnerApplication
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
    target_partners_count = serializers.SerializerMethodField()
    targeted_partner_names = serializers.SerializerMethodField()
    
    class Meta:
        model = Campaign
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'vetted_by', 'vetted_at']
    
    def get_target_partners_count(self, obj):
        return obj.target_partners.count()
    
    def get_targeted_partner_names(self, obj):
        return list(obj.target_partners.values_list('organization_name', flat=True))
    
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
    target_partners_data = serializers.SerializerMethodField()
    partner_applications = serializers.SerializerMethodField()
    
    class Meta:
        model = Campaign
        fields = '__all__'
    
    def get_target_partners_data(self, obj):
        return obj.target_partners.values('id', 'organization_name', 'investor_type')
    
    def get_partner_applications(self, obj):
        applications = obj.partner_applications.all()
        return CampaignPartnerApplicationSerializer(applications, many=True).data
    
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
                  'use_of_funds', 'target_partners']
    
    def create(self, validated_data):
        user = self.context['request'].user
        if not hasattr(user, 'enterprise'):
            raise serializers.ValidationError("User must have an enterprise to create a campaign")
        
        target_partners = validated_data.pop('target_partners', [])
        validated_data['enterprise'] = user.enterprise
        campaign = super().create(validated_data)
        
        if target_partners:
            campaign.target_partners.set(target_partners)
        
        return campaign


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


class CampaignPartnerApplicationSerializer(serializers.ModelSerializer):
    """Serializer for partner-specific applications"""
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    partner_name = serializers.CharField(source='partner.organization_name', read_only=True)
    funding_form_name = serializers.CharField(source='funding_form.name', read_only=True)
    enterprise_name = serializers.CharField(source='campaign.enterprise.business_name', read_only=True)
    
    class Meta:
        model = CampaignPartnerApplication
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'reviewed_by', 'reviewed_at', 
                           'auto_screened', 'auto_screen_passed', 'auto_screen_reason']


class CampaignPartnerApplicationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with nested data"""
    campaign_data = CampaignSerializer(source='campaign', read_only=True)
    partner_data = serializers.SerializerMethodField()
    funding_form_data = serializers.SerializerMethodField()
    
    class Meta:
        model = CampaignPartnerApplication
        fields = '__all__'
    
    def get_partner_data(self, obj):
        from investors.serializers import InvestorSerializer
        return InvestorSerializer(obj.partner).data
    
    def get_funding_form_data(self, obj):
        if obj.funding_form:
            from investors.serializers import PartnerFundingFormSerializer
            return PartnerFundingFormSerializer(obj.funding_form).data
        return None


class CampaignPartnerApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating partner applications"""
    
    class Meta:
        model = CampaignPartnerApplication
        fields = ['campaign', 'partner', 'funding_form', 'form_responses']
    
    def validate(self, data):
        # Ensure the partner is in the campaign's target_partners
        campaign = data.get('campaign')
        partner = data.get('partner')
        
        if campaign.target_partners.exists() and partner not in campaign.target_partners.all():
            raise serializers.ValidationError(
                "This partner is not targeted by this campaign."
            )
        
        # Check if application already exists
        if CampaignPartnerApplication.objects.filter(
            campaign=campaign, partner=partner
        ).exists():
            raise serializers.ValidationError(
                "An application to this partner already exists for this campaign."
            )
        
        return data
    
    def create(self, validated_data):
        # Auto-screening logic
        application = CampaignPartnerApplication.objects.create(**validated_data)
        
        # Run auto-screening
        partner = application.partner
        campaign = application.campaign
        
        # Get partner's criteria
        criteria = partner.criteria.filter(is_active=True).first()
        if criteria and criteria.auto_reject_below_score:
            if campaign.readiness_score_at_submission:
                application.auto_screened = True
                if campaign.readiness_score_at_submission < criteria.auto_reject_below_score:
                    application.auto_screen_passed = False
                    application.status = 'declined'
                    application.auto_screen_reason = f"Readiness score ({campaign.readiness_score_at_submission}) is below minimum requirement ({criteria.auto_reject_below_score})"
                else:
                    application.auto_screen_passed = True
                application.save()
        
        return application
