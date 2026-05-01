from rest_framework import viewsets, status, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings as django_settings
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

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], url_path='forgot_password')
    def forgot_password(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Always return success to avoid user enumeration
        generic_response = Response({'message': 'If an account with that email exists, a password reset link has been sent.'})

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return generic_response

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        frontend_url = getattr(django_settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"

        subject = 'Reset your Isonga Platform password'
        body = (
            f"Hi {user.first_name or user.email},\n\n"
            f"We received a request to reset your Isonga Platform password.\n\n"
            f"Click the link below to set a new password:\n{reset_url}\n\n"
            f"This link is valid for 24 hours. If you did not request a password reset, you can safely ignore this email.\n\n"
            f"— The Isonga Team"
        )

        try:
            send_mail(
                subject=subject,
                message=body,
                from_email=getattr(django_settings, 'DEFAULT_FROM_EMAIL', 'noreply@isonga.rw'),
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return generic_response

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], url_path='reset_password_confirm')
    def reset_password_confirm(self, request):
        uid = request.data.get('uid', '')
        token = request.data.get('token', '')
        password = request.data.get('password', '')

        if not uid or not token or not password:
            return Response({'error': 'uid, token, and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({'error': 'Password must be at least 8 characters long'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_pk)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'This reset link is invalid or has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()
        return Response({'message': 'Password reset successfully. You can now log in with your new password.'})
