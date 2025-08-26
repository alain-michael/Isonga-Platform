from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Enterprise, EnterpriseDocument
from .serializers import EnterpriseSerializer, EnterpriseListSerializer, EnterpriseDocumentSerializer

class EnterpriseViewSet(viewsets.ModelViewSet):
    queryset = Enterprise.objects.all()
    serializer_class = EnterpriseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EnterpriseListSerializer
        return EnterpriseSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'enterprise':
            return Enterprise.objects.filter(user=user)
        elif user.user_type in ['admin', 'superadmin']:
            queryset = Enterprise.objects.all()
            # Add search by TIN number
            tin = self.request.query_params.get('tin', None)
            if tin:
                queryset = queryset.filter(tin_number__icontains=tin)
            return queryset
        return Enterprise.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vet(self, request, pk=None):
        """Admin action to vet an enterprise"""
        if request.user.user_type not in ['admin', 'superadmin']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        enterprise = get_object_or_404(Enterprise, pk=pk)
        enterprise.is_vetted = True
        enterprise.vetted_by = request.user
        enterprise.vetted_at = timezone.now()
        enterprise.save()
        
        return Response({'message': 'Enterprise vetted successfully'})
    
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
    queryset = EnterpriseDocument.objects.all()
    serializer_class = EnterpriseDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'enterprise':
            return EnterpriseDocument.objects.filter(enterprise__user=user)
        elif user.user_type in ['admin', 'superadmin']:
            return EnterpriseDocument.objects.all()
        return EnterpriseDocument.objects.none()
