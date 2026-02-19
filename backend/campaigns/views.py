from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.db.models import Q, Avg
from .models import Campaign, CampaignDocument, CampaignInterest, CampaignUpdate, CampaignMessage
from .serializers import (
    CampaignSerializer, CampaignDetailSerializer, CampaignCreateSerializer,
    CampaignDocumentSerializer, CampaignInterestSerializer, CampaignUpdateSerializer,
    CampaignMessageSerializer
)


class IsEnterpriseOwner(permissions.BasePermission):
    """Check if user owns the enterprise"""
    def has_object_permission(self, request, view, obj):
        # Admins can do anything
        if request.user.user_type in ['admin', 'superadmin']:
            return True
        
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
        
        # Investors/Partners see only active (partner-visible) campaigns that meet their criteria
        if hasattr(user, 'investor_profile'):
            investor = user.investor_profile
            
            # Get investor's criteria
            criteria = investor.criteria.filter(is_active=True).first()
            min_score = criteria.min_readiness_score if criteria else 0
            
            # Filter campaigns by readiness score
            return Campaign.objects.filter(
                status='active',
                is_vetted=True,
                readiness_score_at_submission__gte=min_score
            ) | Campaign.objects.filter(
                interests__investor=investor
            )
        
        # Enterprise users see their own campaigns
        if hasattr(user, 'enterprise'):
            return Campaign.objects.filter(enterprise=user.enterprise)
        
        return Campaign.objects.none()
    
    def perform_update(self, serializer):
        """Override update to reset vetted status when enterprise edits campaign"""
        campaign = self.get_object()
        user = self.request.user
        
        # If enterprise (not admin) is editing a vetted or active campaign,
        # reset it to draft to require re-approval
        if (hasattr(user, 'enterprise') and 
            user.user_type not in ['admin', 'superadmin'] and
            (campaign.is_vetted or campaign.status in ['vetted', 'active'])):
            serializer.save(
                status='draft',
                is_vetted=False,
                vetted_by=None,
                vetted_at=None
            )
        else:
            serializer.save()
    
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
        """Submit funding application for admin review"""
        campaign = self.get_object()
        
        if campaign.status not in ['draft', 'revision_required']:
            return Response({'error': 'Application can only be submitted from draft or revision required status'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check readiness score before submission
        enterprise = campaign.enterprise
        from assessments.models import Assessment
        avg_score = Assessment.objects.filter(
            enterprise=enterprise,
            status='completed'
        ).aggregate(avg=Avg('percentage_score'))['avg'] or 0
        
        # Store readiness score at submission
        campaign.readiness_score_at_submission = avg_score
        campaign.status = 'submitted'
        
        # Track if this is a resubmission
        if campaign.revision_notes:
            campaign.revision_count += 1
        
        campaign.save()
        
        return Response({
            'message': 'Funding application submitted for review',
            'readiness_score': float(avg_score)
        })
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Admin approves a funding application - makes it visible to partners"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        campaign = self.get_object()
        
        if campaign.status not in ['submitted']:
            return Response({'error': 'Only submitted applications can be approved'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        campaign.status = 'approved'
        campaign.is_vetted = True
        campaign.vetted_by = request.user
        campaign.vetted_at = timezone.now()
        campaign.vetting_notes = request.data.get('notes', '')
        campaign.revision_notes = None  # Clear revision notes
        campaign.save()
        
        return Response({'message': 'Funding application approved'})
    
    @action(detail=True, methods=['post'])
    def require_revision(self, request, pk=None):
        """Admin requests revision on a funding application"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        campaign = self.get_object()
        
        if campaign.status not in ['submitted']:
            return Response({'error': 'Only submitted applications can be sent for revision'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        revision_notes = request.data.get('notes', '')
        if not revision_notes:
            return Response({'error': 'Revision notes are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        campaign.status = 'revision_required'
        campaign.revision_notes = revision_notes
        campaign.save()
        
        return Response({'message': 'Revision request sent to SME'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Admin rejects a funding application"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        campaign = self.get_object()
        
        if campaign.status not in ['submitted', 'revision_required']:
            return Response({'error': 'Only submitted or revision required applications can be rejected'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        campaign.status = 'rejected'
        campaign.vetting_notes = request.data.get('notes', '')
        campaign.save()
        
        return Response({'message': 'Funding application rejected'})
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Make an approved funding application visible to partners"""
        campaign = self.get_object()
        
        # Can be activated by admin or by enterprise owner
        if request.user.user_type not in ['admin', 'superadmin']:
            if not hasattr(request.user, 'enterprise') or campaign.enterprise != request.user.enterprise:
                return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        if campaign.status != 'approved':
            return Response({'error': 'Only approved applications can be activated'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        campaign.status = 'active'
        campaign.save()
        
        return Response({'message': 'Funding application is now visible to partners'})
    
    @action(detail=True, methods=['get'])
    def check_eligibility(self, request, pk=None):
        """Check if enterprise meets readiness criteria for partners"""
        campaign = self.get_object()
        enterprise = campaign.enterprise
        
        from assessments.models import Assessment
        from investors.models import InvestorCriteria
        
        # Get enterprise's average readiness score
        avg_score = Assessment.objects.filter(
            enterprise=enterprise,
            status='completed'
        ).aggregate(avg=Avg('percentage_score'))['avg'] or 0
        
        # Get all partner criteria
        criteria_list = InvestorCriteria.objects.filter(is_active=True)
        
        eligible_partners = []
        for criteria in criteria_list:
            if avg_score >= criteria.min_readiness_score:
                eligible_partners.append({
                    'investor_id': criteria.investor.id,
                    'investor_name': str(criteria.investor),
                    'min_score_required': float(criteria.min_readiness_score),
                    'eligible': True
                })
            else:
                eligible_partners.append({
                    'investor_id': criteria.investor.id,
                    'investor_name': str(criteria.investor),
                    'min_score_required': float(criteria.min_readiness_score),
                    'eligible': False,
                    'score_gap': float(criteria.min_readiness_score - avg_score)
                })
        
        return Response({
            'readiness_score': float(avg_score),
            'eligible_partners': [p for p in eligible_partners if p['eligible']],
            'ineligible_partners': [p for p in eligible_partners if not p['eligible']],
            'total_partners': len(criteria_list),
            'eligible_count': len([p for p in eligible_partners if p['eligible']])
        })
    
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
    
    def perform_create(self, serializer):
        # Get campaign from the request data
        campaign_id = self.request.data.get('campaign')
        if campaign_id:
            serializer.save(campaign_id=campaign_id)
        else:
            serializer.save()


class CampaignUpdateViewSet(viewsets.ModelViewSet):
    queryset = CampaignUpdate.objects.all()
    serializer_class = CampaignUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        campaign_id = self.request.query_params.get('campaign_id')
        if campaign_id:
            return CampaignUpdate.objects.filter(campaign_id=campaign_id)
        return CampaignUpdate.objects.none()
    
    def perform_create(self, serializer):
        # Auto-set posted_by to current user
        serializer.save(posted_by=self.request.user)


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
    def commit(self, request, pk=None):
        """Investor commits to an amount after interest is approved"""
        interest = self.get_object()
        
        if not hasattr(request.user, 'investor_profile') or interest.investor != request.user.investor_profile:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        committed_amount = request.data.get('committed_amount')
        if not committed_amount:
            return Response({'error': 'committed_amount is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        interest.status = 'committed'
        interest.committed_amount = committed_amount
        interest.save()
        
        return Response({'message': 'Amount committed successfully'})
    
    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        """Investor withdraws interest"""
        interest = self.get_object()
        
        if not hasattr(request.user, 'investor_profile') or interest.investor != request.user.investor_profile:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        interest.status = 'withdrawn'
        interest.save()
        
        return Response({'message': 'Interest withdrawn'})


class CampaignMessageViewSet(viewsets.ModelViewSet):
    queryset = CampaignMessage.objects.all()
    serializer_class = CampaignMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        campaign_id = self.request.query_params.get('campaign_id')
        interest_id = self.request.query_params.get('interest_id')
        
        queryset = CampaignMessage.objects.filter(
            Q(sender=user) | Q(receiver=user)
        )
        
        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)
        
        if interest_id:
            queryset = queryset.filter(interest_id=interest_id)
        
        return queryset.order_by('created_at')
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark message as read"""
        message = self.get_object()
        
        if message.receiver != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        message.is_read = True
        message.save()
        
        return Response({'message': 'Message marked as read'})
