from django.contrib.auth.models import AbstractUser
from django.db import models

from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, phone_number, email, password=None, **extra_fields):
        if not phone_number:
            raise ValueError("Users must have a phone number")

        email = self.normalize_email(email)
        user = self.model(phone_number=phone_number, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


    def create_superuser(self, phone_number, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(phone_number, email, password, **extra_fields)

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

    objects = UserManager()
    
    def __str__(self):
        return f"{self.phone_number} ({self.get_user_type_display()})"
