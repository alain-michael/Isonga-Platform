from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from enterprises.models import Enterprise
from assessments.models import Assessment, Questionnaire
from assessments.serializers import AssessmentSerializer
from enterprises.serializers import EnterpriseSerializer


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get dashboard statistics for admin"""
        if not request.user.is_staff and request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Calculate stats
        total_enterprises = Enterprise.objects.count()
        vetted_enterprises = Enterprise.objects.filter(is_vetted=True).count()
        pending_enterprises = total_enterprises - vetted_enterprises
        
        # Assessment stats
        total_assessments = Assessment.objects.count()
        completed_assessments = Assessment.objects.filter(status='submitted').count()
        pending_assessments = Assessment.objects.filter(status='pending').count()
        in_progress_assessments = Assessment.objects.filter(status='in_progress').count()
        
        # User stats
        total_users = User.objects.count()
        
        stats = {
            'totalEnterprises': total_enterprises,
            'vettedEnterprises': vetted_enterprises,
            'pendingEnterprises': pending_enterprises,
            'activeAssessments': in_progress_assessments,
            'completedAssessments': completed_assessments,
            'pendingReviews': pending_assessments,
            'totalUsers': total_users,
            'totalPayments': 0  # Will implement when payments are ready
        }
        
        return Response(stats)


class RecentAssessmentsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get recent assessments for admin dashboard"""
        if not request.user.is_staff and request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        limit = int(request.GET.get('limit', 10))
        
        # Get recent assessments
        assessments = Assessment.objects.select_related(
            'enterprise', 'questionnaire', 'reviewed_by'
        ).order_by('-created_at')[:limit]
        
        # Serialize the data
        serializer = AssessmentSerializer(assessments, many=True)
        return Response(serializer.data)


class RecentEnterprisesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get recent enterprises for admin dashboard"""
        if not request.user.is_staff and request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        limit = int(request.GET.get('limit', 10))
        
        # Get recent enterprises
        enterprises = Enterprise.objects.select_related('owner').order_by('-created_at')[:limit]
        
        # Serialize the data
        serializer = EnterpriseSerializer(enterprises, many=True)
        return Response(serializer.data)


class SystemMetricsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get system metrics for charts"""
        if not request.user.is_staff and request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # User growth over last 6 months
        months = []
        user_growth = []
        now = timezone.now()
        
        for i in range(6, 0, -1):
            month_date = now - timedelta(days=30 * i)
            month_label = month_date.strftime('%B')
            users_count = User.objects.filter(date_joined__month=month_date.month).count()
            months.append(month_label)
            user_growth.append(users_count)
        
        # Assessment completion rates
        assessment_completion = [
            {'label': 'Completed', 'value': Assessment.objects.filter(status='submitted').count()},
            {'label': 'In Progress', 'value': Assessment.objects.filter(status='in_progress').count()},
            {'label': 'Pending', 'value': Assessment.objects.filter(status='pending').count()},
        ]
        
        # Sector distribution
        sector_distribution = []
        sectors = Enterprise.objects.values('sector').annotate(count=Count('sector'))
        for sector in sectors:
            if sector['sector']:
                sector_distribution.append({
                    'label': sector['sector'],
                    'value': sector['count']
                })
        
        metrics = {
            'userGrowth': [{'label': months[i], 'value': user_growth[i]} for i in range(len(months))],
            'assessmentCompletion': assessment_completion,
            'sectorDistribution': sector_distribution,
            'monthlyRevenue': []  # Will implement when payments are ready
        }
        
        return Response(metrics)
