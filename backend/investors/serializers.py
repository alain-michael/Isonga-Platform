from rest_framework import serializers
from .models import Investor, InvestorCriteria, Match, MatchInteraction
from accounts.models import User
from enterprises.models import Enterprise
from campaigns.models import Campaign


class InvestorUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class InvestorSerializer(serializers.ModelSerializer):
    user = InvestorUserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='user', 
        write_only=True,
        required=False
    )
    user_data = serializers.DictField(write_only=True, required=False)
    criteria = serializers.SerializerMethodField()
    
    class Meta:
        model = Investor
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_criteria(self, obj):
        criteria = obj.criteria.filter(is_active=True)
        return InvestorCriteriaSerializer(criteria, many=True).data
    
    def create(self, validated_data):
        user_data = validated_data.pop('user_data', None)
        
        if user_data:
            # Create user account
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
                user_type='investor'
            )
            validated_data['user'] = user
        
        request = self.context.get('request')
        if request and request.user:
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)


class InvestorCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestorCriteria
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class EnterpriseMatchSerializer(serializers.ModelSerializer):
    """Simplified enterprise serializer for matches"""
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = Enterprise
        fields = ['id', 'business_name', 'sector', 'enterprise_size', 'district', 
                  'number_of_employees', 'annual_revenue', 'verification_status', 'user_id']


class InvestorMatchSerializer(serializers.ModelSerializer):
    """Simplified investor serializer for matches"""
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = Investor
        fields = ['id', 'organization_name', 'investor_type', 'contact_email', 'user_id']


class MatchSerializer(serializers.ModelSerializer):
    enterprise = EnterpriseMatchSerializer(read_only=True)
    investor = InvestorMatchSerializer(read_only=True)
    enterprise_id = serializers.PrimaryKeyRelatedField(
        queryset=Enterprise.objects.all(),
        source='enterprise',
        write_only=True
    )
    investor_id = serializers.PrimaryKeyRelatedField(
        queryset=Investor.objects.all(),
        source='investor',
        write_only=True
    )
    
    class Meta:
        model = Match
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'payment_received', 'payment_received_at']


class MatchInteractionSerializer(serializers.ModelSerializer):
    initiated_by_name = serializers.CharField(source='initiated_by.get_full_name', read_only=True)
    
    class Meta:
        model = MatchInteraction
        fields = '__all__'
        read_only_fields = ['created_at']


class MatchDetailSerializer(serializers.ModelSerializer):
    """Detailed match serializer with interactions"""
    enterprise = EnterpriseMatchSerializer(read_only=True)
    investor = InvestorMatchSerializer(read_only=True)
    interactions = MatchInteractionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Match
        fields = '__all__'


class MatchedCampaignSerializer(serializers.ModelSerializer):
    enterprise_name = serializers.CharField(source='enterprise.business_name')
    enterprise_sector = serializers.CharField(source='enterprise.sector')
    enterprise_location = serializers.CharField(source='enterprise.city')
    match_score = serializers.IntegerField(read_only=True)
    interested_at = serializers.DateTimeField(read_only=True, required=False)
    documents = serializers.SerializerMethodField()
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'title', 'description', 'target_amount', 'amount_raised',
            'min_investment', 'max_investment', 'campaign_type', 'status',
            'start_date', 'end_date', 'enterprise_name',
            'enterprise_sector', 'enterprise_location', 'match_score', 'interested_at',
            'documents'
        ]
    
    def get_documents(self, obj):
        from campaigns.serializers import CampaignDocumentSerializer
        documents = obj.documents.filter(is_public=True)
        return CampaignDocumentSerializer(documents, many=True, context=self.context).data
