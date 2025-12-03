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
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
