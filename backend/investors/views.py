from rest_framework import viewsets, permissions, status, generics
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Investor, InvestorCriteria, Match, MatchInteraction
from .serializers import (
    InvestorSerializer, InvestorCriteriaSerializer, 
    MatchSerializer, MatchDetailSerializer, MatchInteractionSerializer,
    MatchedCampaignSerializer
)
from enterprises.models import Enterprise
from campaigns.models import Campaign
from rest_framework import generics


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow admins to create/edit, others to read only"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.user_type in ['admin', 'superadmin']


class IsInvestor(permissions.BasePermission):
    """Check if user is an investor"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'investor_profile')


from rest_framework.decorators import action, api_view, permission_classes
from django.db.models import Sum, Count

class InvestorViewSet(viewsets.ModelViewSet):
    queryset = Investor.objects.filter(is_active=True)
    serializer_class = InvestorSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type in ['admin', 'superadmin']:
            return Investor.objects.all()
        if hasattr(user, 'investor_profile'):
            return Investor.objects.filter(user=user)
        return Investor.objects.none()
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get investor dashboard stats"""
        user = request.user
        if not hasattr(user, 'investor_profile'):
            return Response({'error': 'User is not an investor'}, status=400)
            
        investor = user.investor_profile
        
        # Calculate stats
        # Active Matches: Matches that are approved/engaged but not yet completed
        active_matches = Match.objects.filter(
            investor=investor, 
            status__in=['approved', 'engaged']
        ).count()
        
        # Pending Requests: Matches pending review
        pending_requests = Match.objects.filter(
            investor=investor, 
            status='pending'
        ).count()
        
        # Total Investments: Completed matches (assuming completed means investment made)
        # In a real system, this would query an Investment/Transaction model
        completed_matches = Match.objects.filter(
            investor=investor, 
            status='completed'
        )
        total_investments = completed_matches.count()
        
        # Portfolio Value: Sum of target amounts of completed matches (Proxy)
        # Ideally this should be the actual amount invested
        # We'll use a sum of 'amount_raised' from campaigns associated with completed matches if possible
        # But Match links to Enterprise, not Campaign directly in the model shown.
        # Let's assume for now we sum the 'min_investment' or just 0 if no data.
        # Better proxy: Sum of 'match_score' * 1000 just to show a number? No, that's bad.
        # Let's use 0 for now as we don't have an Investment model yet.
        portfolio_value = 0 
        
        return Response({
            'activeMatches': active_matches,
            'pendingRequests': pending_requests,
            'totalInvestments': total_investments,
            'portfolioValue': f"${portfolio_value:,}"
        })

    @action(detail=True, methods=['get'])
    def criteria(self, request, pk=None):
        """Get investor's matching criteria"""
        investor = self.get_object()
        criteria = InvestorCriteria.objects.filter(investor=investor)
        serializer = InvestorCriteriaSerializer(criteria, many=True)
        return Response(serializer.data)


class InvestorCriteriaViewSet(viewsets.ModelViewSet):
    queryset = InvestorCriteria.objects.all()
    serializer_class = InvestorCriteriaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type in ['admin', 'superadmin']:
            return InvestorCriteria.objects.all()
        if hasattr(user, 'investor_profile'):
            return InvestorCriteria.objects.filter(investor=user.investor_profile)
        return InvestorCriteria.objects.none()


class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MatchDetailSerializer
        return MatchSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type in ['admin', 'superadmin']:
            return Match.objects.all().select_related('enterprise__user', 'investor__user', 'campaign')
        if hasattr(user, 'investor_profile'):
            return Match.objects.filter(investor=user.investor_profile).select_related('enterprise__user', 'investor__user', 'campaign')
        if user.user_type == 'enterprise' and hasattr(user, 'enterprise'):
            return Match.objects.filter(enterprise=user.enterprise).select_related('enterprise__user', 'investor__user', 'campaign')
        return Match.objects.none()
    
    @action(detail=False, methods=['get'])
    def find_matches(self, request):
        """Find potential matches for an investor based on criteria"""
        if not hasattr(request.user, 'investor_profile'):
            return Response({'error': 'Not an investor'}, status=status.HTTP_403_FORBIDDEN)
        
        investor = request.user.investor_profile
        criteria = InvestorCriteria.objects.filter(investor=investor, is_active=True).first()
        
        if not criteria:
            return Response({'error': 'No matching criteria set'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Build query based on criteria
        enterprises = Enterprise.objects.filter(
            verification_status='approved',
            is_vetted=True
        )
        
        # Filter by sector
        if criteria.sectors:
            enterprises = enterprises.filter(sector__in=criteria.sectors)
        
        # Filter by management structure (if criteria specifies)
        if criteria.preferred_sizes:
            enterprises = enterprises.filter(management_structure__in=criteria.preferred_sizes)
        
        # Filter by years of operation
        from datetime import datetime
        if criteria.min_years_operation > 0:
            max_year = datetime.now().year - criteria.min_years_operation
            enterprises = enterprises.filter(year_established__lte=max_year)
        
        # Filter by employees
        if criteria.min_employees > 0:
            enterprises = enterprises.filter(number_of_employees__gte=criteria.min_employees)
        
        # Exclude already matched
        existing_matches = Match.objects.filter(investor=investor).values_list('enterprise_id', flat=True)
        enterprises = enterprises.exclude(id__in=existing_matches)
        
        # Return serialized data
        from enterprises.serializers import EnterpriseSerializer
        serializer = EnterpriseSerializer(enterprises[:50], many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Investor approves a match"""
        match = self.get_object()
        
        if not hasattr(request.user, 'investor_profile') or match.investor != request.user.investor_profile:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        match.investor_approved = True
        match.investor_notes = request.data.get('notes', '')
        match.status = 'approved'
        match.save()
        
        # Create interaction
        MatchInteraction.objects.create(
            match=match,
            initiated_by=request.user,
            interaction_type='status_change',
            content='Match approved by investor'
        )
        
        return Response({'message': 'Match approved'})
    
    @action(detail=True, methods=['post'])
    def request_documents(self, request, pk=None):
        """Investor requests documents from SME"""
        match = self.get_object()
        
        if not hasattr(request.user, 'investor_profile') or match.investor != request.user.investor_profile:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        documents = request.data.get('documents', [])
        match.documents_requested = documents
        match.save()
        
        # Create interaction
        MatchInteraction.objects.create(
            match=match,
            initiated_by=request.user,
            interaction_type='document_request',
            content=f'Requested documents: {", ".join(documents)}',
            metadata={'documents': documents}
        )
        
        return Response({'message': 'Documents requested'})
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Enterprise accepts a match"""
        match = self.get_object()
        
        if not hasattr(request.user, 'enterprise') or match.enterprise != request.user.enterprise:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        match.enterprise_accepted = True
        match.enterprise_notes = request.data.get('notes', '')
        match.status = 'engaged'
        match.save()
        
        # Create interaction
        MatchInteraction.objects.create(
            match=match,
            initiated_by=request.user,
            interaction_type='status_change',
            content='Match accepted by enterprise'
        )
        
        return Response({'message': 'Match accepted'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Enterprise rejects a match"""
        match = self.get_object()
        
        if not hasattr(request.user, 'enterprise') or match.enterprise != request.user.enterprise:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        match.status = 'rejected'
        match.save()
        
        # Create interaction
        MatchInteraction.objects.create(
            match=match,
            initiated_by=request.user,
            interaction_type='status_change',
            content='Match rejected by enterprise'
        )
        
        return Response({'message': 'Match rejected'})

    @action(detail=True, methods=['post'])
    def commit(self, request, pk=None):
        """Investor commits to an investment amount"""
        match = self.get_object()
        
        if not hasattr(request.user, 'investor_profile') or match.investor != request.user.investor_profile:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        committed_amount = request.data.get('committed_amount')
        if not committed_amount:
            return Response({'error': 'committed_amount is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.utils import timezone
        match.status = 'engaged'
        match.committed_amount = committed_amount
        match.committed_at = timezone.now()
        match.save()
        
        # Create interaction
        MatchInteraction.objects.create(
            match=match,
            initiated_by=request.user,
            interaction_type='status_change',
            content=f'Investor committed ${committed_amount}'
        )
        
        return Response({'message': 'Amount committed successfully'})
    
    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        """Investor withdraws from a match"""
        match = self.get_object()
        
        if not hasattr(request.user, 'investor_profile') or match.investor != request.user.investor_profile:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        match.status = 'withdrawn'
        match.save()
        
        # Create interaction
        MatchInteraction.objects.create(
            match=match,
            initiated_by=request.user,
            interaction_type='status_change',
            content='Investor withdrew from match'
        )
        
        return Response({'message': 'Match withdrawn'})
    
    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        """Enterprise confirms payment received from investor"""
        match = self.get_object()
        
        if not hasattr(request.user, 'enterprise') or match.enterprise != request.user.enterprise:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        if not match.committed_amount:
            return Response({'error': 'No commitment made yet'}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.utils import timezone
        match.payment_received = True
        match.payment_received_at = timezone.now()
        match.status = 'completed'
        match.save()
        
        # Update campaign amount_raised
        campaign = match.campaign
        campaign.amount_raised += match.committed_amount
        campaign.save()
        
        # Create interaction
        MatchInteraction.objects.create(
            match=match,
            initiated_by=request.user,
            interaction_type='status_change',
            content=f'Payment of ${match.committed_amount} confirmed received'
        )
        
        return Response({'message': 'Payment confirmed successfully'})


class MatchInteractionViewSet(viewsets.ModelViewSet):
    queryset = MatchInteraction.objects.all()
    serializer_class = MatchInteractionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        match_id = self.request.query_params.get('match_id')
        
        if match_id:
            return MatchInteraction.objects.filter(match_id=match_id)
        
        if user.user_type in ['admin', 'superadmin']:
            return MatchInteraction.objects.all()
        if hasattr(user, 'investor_profile'):
            return MatchInteraction.objects.filter(match__investor=user.investor_profile)
        if hasattr(user, 'enterprise'):
            return MatchInteraction.objects.filter(match__enterprise=user.enterprise)
        return MatchInteraction.objects.none()


class InvestorMatchesView(generics.ListAPIView):
    serializer_class = MatchedCampaignSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'investor_profile'):
            return Campaign.objects.none()

        investor = user.investor_profile
        # Get the first criteria set (assuming one for now)
        criteria = investor.criteria.first()
        
        queryset = Campaign.objects.filter(status='active')

        # Exclude campaigns where investor already has a match
        existing_match_campaigns = Match.objects.filter(
            investor=investor
        ).values_list('campaign_id', flat=True)
        if self.request.query_params.get('exclude_existing', 'false').lower() == 'false':
            pass
        else:
            queryset = queryset.exclude(id__in=existing_match_campaigns)

        if not criteria:
            return queryset[:50]

        # Calculate matches in Python for scoring
        # Note: For large datasets, this should be done in DB or search engine
        matches = []
        for campaign in queryset:
            score = 0
            enterprise = campaign.enterprise
            
            # Sector match (+30)
            if enterprise.sector in criteria.sectors:
                score += 30
            
            # Funding amount match (+20)
            if (criteria.min_funding_amount <= campaign.target_amount <= criteria.max_funding_amount):
                score += 20
            
            # Management structure match (+15)
            if enterprise.management_structure in criteria.preferred_sizes:
                score += 15
                
            # Min investment match (+10)
            if campaign.min_investment <= investor.max_investment:
                score += 10

            # Only include if score > 0
            if score > 0:
                campaign.match_score = score
                matches.append(campaign)
        
        # Sort by score descending
        matches.sort(key=lambda x: x.match_score, reverse=True)
        return matches

    
    def perform_create(self, serializer):
        serializer.save(initiated_by=self.request.user)


class InterestedCampaignsView(generics.ListAPIView):
    """Get campaigns where investor has expressed interest (approved matches)"""
    serializer_class = MatchedCampaignSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'investor_profile'):
            return Campaign.objects.none()

        investor = user.investor_profile
        
        # Get campaigns where investor has matches (any status except rejected)
        matches = Match.objects.filter(
            investor=investor
        ).exclude(status='rejected').select_related('campaign', 'campaign__enterprise')
        
        result = []
        for match in matches:
            campaign = match.campaign
            campaign.interested_at = match.created_at
            campaign.match_score = int(match.match_score or 0)
            campaign.match_status = match.status
            campaign.committed_amount = match.committed_amount
            result.append(campaign)
        
        return result
    
class InteractWithOpportunityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        if not hasattr(user, 'investor_profile'):
            return Response({'error': 'Not an investor'}, status=403)
        
        investor = user.investor_profile
        campaign = get_object_or_404(Campaign, pk=pk)
        enterprise = campaign.enterprise
        
        action = request.data.get('action')
        
        if action not in ['approve', 'reject']:
            return Response({'error': 'Invalid action'}, status=400)
            
        # Check if match exists
        match, created = Match.objects.get_or_create(
            investor=investor,
            campaign=campaign,
            defaults={
                'enterprise': enterprise,
                'status': 'pending'
            }
        )
        
        if action == 'approve':
            match.status = 'approved'
            match.investor_approved = True
            match.save()
            
            # Create interaction record
            MatchInteraction.objects.create(
                match=match,
                initiated_by=user,
                interaction_type='status_change',
                content='Investor expressed interest in campaign'
            )
            
            return Response({'message': 'Interest expressed successfully', 'match_id': str(match.id)})
            
        elif action == 'reject':
            match.status = 'rejected'
            match.save()
            return Response({'message': 'Campaign passed', 'match_id': str(match.id)})
            
        return Response({'error': 'Unknown error'}, status=500)
