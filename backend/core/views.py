from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta
from .models import AuditLog, Notification, UserPreferences, DeletionRequest
from .serializers import (
    AuditLogSerializer, NotificationSerializer, 
    UserPreferencesSerializer, DeletionRequestSerializer
)


class IsAdminUser(permissions.BasePermission):
    """Only allow admin users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type in ['admin', 'superadmin']


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """View-only access to audit logs for admins"""
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = AuditLog.objects.all().order_by('-timestamp')
        
        # Filter by action
        action_filter = self.request.query_params.get('action')
        if action_filter:
            queryset = queryset.filter(action=action_filter)
        
        # Filter by model name
        model_name = self.request.query_params.get('model_name')
        if model_name:
            queryset = queryset.filter(model_name=model_name)
        
        # Filter by user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get audit log summary for dashboard"""
        today = timezone.now().date()
        last_30_days = today - timedelta(days=30)
        
        logs = AuditLog.objects.filter(timestamp__date__gte=last_30_days)
        
        summary = {
            'total_actions': logs.count(),
            'by_action': list(logs.values('action').annotate(count=Count('id'))),
            'by_model': list(logs.values('model_name').annotate(count=Count('id'))),
            'recent': AuditLogSerializer(logs[:10], many=True).data
        }
        
        return Response(summary)


class NotificationViewSet(viewsets.ModelViewSet):
    """Manage user notifications"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        notifications = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'count': count})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        return Response({'message': 'Notification marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().filter(is_read=False).update(
            is_read=True, 
            read_at=timezone.now()
        )
        return Response({'message': 'All notifications marked as read'})
    
    @action(detail=False, methods=['delete'])
    def clear_read(self, request):
        """Delete all read notifications"""
        self.get_queryset().filter(is_read=True).delete()
        return Response({'message': 'Read notifications cleared'})


class UserPreferencesViewSet(viewsets.ModelViewSet):
    """Manage user preferences"""
    queryset = UserPreferences.objects.all()
    serializer_class = UserPreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserPreferences.objects.filter(user=self.request.user)
    
    def get_object(self):
        # Get or create preferences for current user
        preferences, created = UserPreferences.objects.get_or_create(
            user=self.request.user,
            defaults={'language': 'en', 'timezone': 'Africa/Kigali'}
        )
        return preferences
    
    def list(self, request):
        """Get current user's preferences"""
        preferences = self.get_object()
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)
    
    def create(self, request):
        """Create or update preferences"""
        preferences = self.get_object()
        serializer = self.get_serializer(preferences, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeletionRequestViewSet(viewsets.ModelViewSet):
    """Handle data deletion requests (GDPR compliance)"""
    queryset = DeletionRequest.objects.all()
    serializer_class = DeletionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type in ['admin', 'superadmin']:
            return DeletionRequest.objects.all().order_by('-created_at')
        return DeletionRequest.objects.filter(user=user)
    
    def create(self, request):
        """Create a deletion request"""
        # Check if there's already a pending request
        existing = DeletionRequest.objects.filter(
            user=request.user, 
            status='pending'
        ).exists()
        
        if existing:
            return Response(
                {'error': 'You already have a pending deletion request'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data={
            'user': request.user.id,
            'reason': request.data.get('reason', ''),
        })
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Admin approves deletion request"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        deletion_request = self.get_object()
        deletion_request.status = 'approved'
        deletion_request.reviewed_by = request.user
        deletion_request.reviewed_at = timezone.now()
        deletion_request.admin_notes = request.data.get('notes', '')
        deletion_request.save()
        
        # TODO: Schedule actual data deletion
        
        return Response({'message': 'Deletion request approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Admin rejects deletion request"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        deletion_request = self.get_object()
        deletion_request.status = 'rejected'
        deletion_request.reviewed_by = request.user
        deletion_request.reviewed_at = timezone.now()
        deletion_request.admin_notes = request.data.get('notes', '')
        deletion_request.save()
        
        return Response({'message': 'Deletion request rejected'})
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """User cancels their own deletion request"""
        deletion_request = self.get_object()
        
        if deletion_request.user != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        if deletion_request.status != 'pending':
            return Response({'error': 'Can only cancel pending requests'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        deletion_request.delete()
        return Response({'message': 'Deletion request cancelled'})
