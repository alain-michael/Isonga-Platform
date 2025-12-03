from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from .models import Campaign, CampaignDocument, CampaignInterest
from .serializers import (
    CampaignSerializer, CampaignDetailSerializer, CampaignCreateSerializer,
    CampaignDocumentSerializer, CampaignInterestSerializer
)


class IsEnterpriseOwner(permissions.BasePermission):
    """Check if user owns the enterprise"""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return hasattr(request.user, 'enterprise') and obj.enterprise == request.user.enterprise


class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsEnterpriseOwner]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CampaignCreateSerializer
        if self.action == 'retrieve':
            return CampaignDetailSerializer
        return CampaignSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Admins see all
        if user.user_type in ['admin', 'superadmin']:
            return Campaign.objects.all()
        
        # Investors see vetted, active campaigns
        if hasattr(user, 'investor_profile'):
            return Campaign.objects.filter(
                status='active',
                is_vetted=True
            ) | Campaign.objects.filter(
                interests__investor=user.investor_profile
            )
        
        # Enterprise users see their own campaigns
        if hasattr(user, 'enterprise'):
            return Campaign.objects.filter(enterprise=user.enterprise)
        
        return Campaign.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_campaigns(self, request):
        """Get current user's enterprise campaigns"""
        if not hasattr(request.user, 'enterprise'):
            return Response([])
        
        campaigns = Campaign.objects.filter(enterprise=request.user.enterprise)
        serializer = CampaignSerializer(campaigns, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active campaigns for investors to browse"""
        campaigns = Campaign.objects.filter(
            status='active',
            end_date__gte=timezone.now()
        ).order_by('-is_vetted', '-created_at')
        
        # Filter by sector if provided
        sector = request.query_params.get('sector')
        if sector:
            campaigns = campaigns.filter(enterprise__sector=sector)
        
        # Filter by campaign type
        campaign_type = request.query_params.get('type')
        if campaign_type:
            campaigns = campaigns.filter(campaign_type=campaign_type)
        
        serializer = CampaignSerializer(campaigns, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit_for_review(self, request, pk=None):
        """Submit campaign for admin review"""
        campaign = self.get_object()
        
        if campaign.status != 'draft':
            return Response({'error': 'Campaign is not in draft status'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        campaign.status = 'submitted'
        campaign.save()
        
        return Response({'message': 'Campaign submitted for review'})
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Admin approves/vets a campaign"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        campaign = self.get_object()
        campaign.status = 'vetted'
        campaign.is_vetted = True
        campaign.vetted_by = request.user
        campaign.vetted_at = timezone.now()
        campaign.save()
        
        return Response({'message': 'Campaign approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Admin rejects a campaign"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        campaign = self.get_object()
        campaign.status = 'cancelled'
        campaign.vetting_notes = request.data.get('notes', '')
        campaign.save()
        
        return Response({'message': 'Campaign rejected'})
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a vetted campaign"""
        campaign = self.get_object()
        
        if not campaign.is_vetted:
            return Response({'error': 'Campaign must be vetted first'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        campaign.status = 'active'
        campaign.save()
        
        return Response({'message': 'Campaign activated'})
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a campaign"""
        campaign = self.get_object()
        
        campaign.status = 'completed'
        campaign.save()
        
        return Response({'message': 'Campaign closed'})


class CampaignDocumentViewSet(viewsets.ModelViewSet):
    queryset = CampaignDocument.objects.all()
    serializer_class = CampaignDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        campaign_id = self.request.query_params.get('campaign_id')
        if campaign_id:
            return CampaignDocument.objects.filter(campaign_id=campaign_id)
        return CampaignDocument.objects.none()


class CampaignInterestViewSet(viewsets.ModelViewSet):
    queryset = CampaignInterest.objects.all()
    serializer_class = CampaignInterestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter by campaign
        campaign_id = self.request.query_params.get('campaign_id')
        if campaign_id:
            queryset = CampaignInterest.objects.filter(campaign_id=campaign_id)
            
            # Only owner or admin can see all interests
            if user.user_type in ['admin', 'superadmin']:
                return queryset
            if hasattr(user, 'enterprise'):
                return queryset.filter(campaign__enterprise=user.enterprise)
            if hasattr(user, 'investor_profile'):
                return queryset.filter(investor=user.investor_profile)
        
        # Investors see their own interests
        if hasattr(user, 'investor_profile'):
            return CampaignInterest.objects.filter(investor=user.investor_profile)
        
        # Enterprise sees interests in their campaigns
        if hasattr(user, 'enterprise'):
            return CampaignInterest.objects.filter(campaign__enterprise=user.enterprise)
        
        return CampaignInterest.objects.none()
    
    def perform_create(self, serializer):
        # Auto-set investor from current user
        if hasattr(self.request.user, 'investor_profile'):
            serializer.save(investor=self.request.user.investor_profile)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Enterprise approves interest"""
        interest = self.get_object()
        
        if not hasattr(request.user, 'enterprise') or interest.campaign.enterprise != request.user.enterprise:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        interest.status = 'approved'
        interest.save()
        
        return Response({'message': 'Interest approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Enterprise rejects interest"""
        interest = self.get_object()
        
        if not hasattr(request.user, 'enterprise') or interest.campaign.enterprise != request.user.enterprise:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        interest.status = 'rejected'
        interest.save()
        
        return Response({'message': 'Interest rejected'})
