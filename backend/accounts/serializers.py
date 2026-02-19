from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import *

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 'phone_number', 'is_verified', 'password', 'last_login', 'date_joined', 'is_active']
        read_only_fields = ['id', 'user_type', 'is_verified', 'last_login', 'date_joined']
        extra_kwargs = {
            'username': {'required': False, 'allow_blank': True, 'allow_null': True},
            'phone_number': {'required': True}
        }
        
    def create(self, validated_data):
        password = validated_data.pop('password')
        # Ensure username is set to None or empty if not provided
        if 'username' not in validated_data or not validated_data.get('username'):
            validated_data['username'] = None
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        # Don't allow password update through this serializer
        validated_data.pop('password', None)
        return super().update(instance, validated_data)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 'phone_number', 'is_verified']
        read_only_fields = ['id', 'username', 'user_type']
