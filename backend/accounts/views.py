from rest_framework import viewsets, status, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import UserSerializer, UserProfileSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'phone_number'
    
    def validate(self, attrs):
        # The field is called phone_number but the user may type an email
        identifier = attrs.get('phone_number')
        password = attrs.get('password')
        
        # Try phone_number authentication first
        user = authenticate(username=identifier, password=password)
        
        # If that failed, try looking up by email
        if not user and identifier:
            try:
                user_obj = User.objects.get(email=identifier)
                user = authenticate(username=user_obj.phone_number, password=password)
            except User.DoesNotExist:
                pass
        
        if not user:
            raise serializers.ValidationError('No active account found with the given credentials')
        
        # Create tokens manually
        refresh = RefreshToken.for_user(user)
        
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserProfileSerializer(user).data
        }
        
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.all()
        user_type = self.request.query_params.get('user_type')
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'register']:
            return [permissions.AllowAny()]
        if self.action in ['update', 'partial_update', 'destroy', 'list', 'retrieve']:
            # Only admins can manage other users
            if not (self.request.user.is_staff or self.request.user.user_type in ['admin', 'superadmin']):
                return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User created successfully',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        identifier = request.data.get('phone_number') or request.data.get('email')
        password = request.data.get('password')
        
        if identifier and password:
            # Try to authenticate with phone_number first, then email
            user = None
            
            # Try phone_number authentication
            user = authenticate(username=identifier, password=password)
            
            # If phone_number auth failed, try email
            if not user:
                try:
                    user_obj = User.objects.get(email=identifier)
                    user = authenticate(username=user_obj.phone_number, password=password)
                except User.DoesNotExist:
                    pass
            
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserProfileSerializer(user).data
                })
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response({'error': 'Phone number or email and password required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def refresh(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                return Response({
                    'access': str(token.access_token),
                })
            return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='reset_password')
    def reset_password(self, request, pk=None):
        """Admin action to reset a user's password."""
        if request.user.user_type not in ['admin', 'superadmin'] and not request.user.is_superuser:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        new_password = request.data.get('password')
        if not new_password:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successfully'})
