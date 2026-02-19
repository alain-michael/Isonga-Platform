from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPES = (
        ('superadmin', 'Super Admin'),
        ('admin', 'Admin'),
        ('enterprise', 'Enterprise'),
        ('investor', 'Investor'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='enterprise')
    phone_number = models.CharField(max_length=20, unique=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Make username optional and non-unique
    username = models.CharField(max_length=150, blank=True, null=True)
    
    # Use phone_number as the username field for authentication
    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']
    
    def __str__(self):
        return f"{self.phone_number} ({self.get_user_type_display()})"
