from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Enterprise, EnterpriseDocument
from .serializers import (
    EnterpriseSerializer, 
    EnterpriseListSerializer, 
    EnterpriseDetailSerializer,
    EnterpriseDocumentSerializer
)

class EnterpriseViewSet(viewsets.ModelViewSet):
    queryset = Enterprise.objects.select_related('user', 'vetted_by').prefetch_related('documents')
    serializer_class = EnterpriseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EnterpriseListSerializer
        elif self.action == 'retrieve':
            return EnterpriseDetailSerializer
        return EnterpriseSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'enterprise':
            return Enterprise.objects.filter(user=user).select_related('user', 'vetted_by').prefetch_related('documents')
        elif user.user_type in ['admin', 'superadmin']:
            queryset = Enterprise.objects.all().select_related('user', 'vetted_by').prefetch_related('documents')
            # Add search by TIN number
            tin = self.request.query_params.get('tin', None)
            if tin:
                queryset = queryset.filter(tin_number__icontains=tin)
            return queryset
        return Enterprise.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='my-enterprise')
    def my_enterprise(self, request):
        """Get current user's enterprise"""
        if request.user.user_type != 'enterprise':
            return Response({'error': 'Only enterprise users can access this endpoint'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            enterprise = Enterprise.objects.select_related('user', 'vetted_by').prefetch_related('documents').get(user=request.user)
            serializer = EnterpriseDetailSerializer(enterprise)
            return Response(serializer.data)
        except Enterprise.DoesNotExist:
            return Response({'error': 'No enterprise profile found'}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        """Admin action to approve an enterprise"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        enterprise = get_object_or_404(Enterprise, pk=pk)
        notes = request.data.get('notes', '')
        
        enterprise.verification_status = 'approved'
        enterprise.is_vetted = True  # Keep for backward compatibility
        enterprise.vetted_by = request.user
        enterprise.vetted_at = timezone.now()
        enterprise.verification_notes = notes
        enterprise.save()
        
        return Response({
            'message': 'Enterprise approved successfully',
            'verification_status': enterprise.verification_status
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        """Admin action to reject an enterprise"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        enterprise = get_object_or_404(Enterprise, pk=pk)
        notes = request.data.get('notes', '')
        
        enterprise.verification_status = 'rejected'
        enterprise.is_vetted = False
        enterprise.vetted_by = request.user
        enterprise.vetted_at = timezone.now()
        enterprise.verification_notes = notes
        enterprise.save()
        
        return Response({
            'message': 'Enterprise rejected',
            'verification_status': enterprise.verification_status
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def request_documents(self, request, pk=None):
        """Admin action to request additional documents"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        enterprise = get_object_or_404(Enterprise, pk=pk)
        documents_requested = request.data.get('documents_requested', '')
        notes = request.data.get('notes', '')
        
        enterprise.verification_status = 'documents_requested'
        enterprise.documents_requested = documents_requested
        enterprise.verification_notes = notes
        enterprise.vetted_by = request.user
        enterprise.vetted_at = timezone.now()
        enterprise.save()
        
        return Response({
            'message': 'Documents requested successfully',
            'verification_status': enterprise.verification_status
        })
    
    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        """Upload document for enterprise"""
        enterprise = get_object_or_404(Enterprise, pk=pk)
        
        # Check permissions
        if request.user.user_type == 'enterprise' and enterprise.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = EnterpriseDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(enterprise=enterprise)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get all documents for an enterprise"""
        enterprise = get_object_or_404(Enterprise, pk=pk)
        
        # Check permissions
        if (request.user.user_type == 'enterprise' and enterprise.user != request.user and 
            request.user.user_type not in ['admin', 'superadmin']):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        documents = enterprise.documents.all()
        serializer = EnterpriseDocumentSerializer(documents, many=True)
        return Response(serializer.data)

class EnterpriseDocumentViewSet(viewsets.ModelViewSet):
    queryset = EnterpriseDocument.objects.select_related('enterprise', 'verified_by')
    serializer_class = EnterpriseDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'enterprise':
            return EnterpriseDocument.objects.filter(enterprise__user=user).select_related('enterprise', 'verified_by')
        elif user.user_type in ['admin', 'superadmin']:
            return EnterpriseDocument.objects.all().select_related('enterprise', 'verified_by')
        return EnterpriseDocument.objects.none()
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def verify(self, request, pk=None):
        """Admin action to verify a document"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        document = get_object_or_404(EnterpriseDocument, pk=pk)
        notes = request.data.get('verification_notes', '')
        
        document.is_verified = True
        document.verified_by = request.user
        document.verified_at = timezone.now()
        document.verification_notes = notes
        document.save()
        
        return Response({
            'message': 'Document verified successfully',
            'is_verified': document.is_verified
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject_document(self, request, pk=None):
        """Admin action to reject a document"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        document = get_object_or_404(EnterpriseDocument, pk=pk)
        notes = request.data.get('verification_notes', '')
        
        document.is_verified = False
        document.verified_by = request.user
        document.verified_at = timezone.now()
        document.verification_notes = notes
        document.save()
        
        return Response({
            'message': 'Document rejected',
            'is_verified': document.is_verified
        })
