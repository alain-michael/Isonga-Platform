from django.db import models
from django.contrib.auth import get_user_model
from enterprises.models import Enterprise
import uuid

User = get_user_model()


class Investor(models.Model):
    """Investor profile - created by admins only"""
    INVESTOR_TYPES = (
        ('individual', 'Individual Investor'),
        ('institutional', 'Institutional Investor'),
        ('vc', 'Venture Capital'),
        ('pe', 'Private Equity'),
        ('angel', 'Angel Investor'),
        ('bank', 'Bank/Financial Institution'),
        ('dfi', 'Development Finance Institution'),
        ('other', 'Other'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='investor_profile')
    investor_type = models.CharField(max_length=20, choices=INVESTOR_TYPES)
    organization_name = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Contact
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    # Investment preferences
    min_investment = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    max_investment = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_investors')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.organization_name or self.user.get_full_name()} ({self.get_investor_type_display()})"

    class Meta:
        ordering = ['-created_at']


class InvestorCriteria(models.Model):
    """Matching criteria set by investor"""
    SECTORS = (
        ('agriculture', 'Agriculture'),
        ('manufacturing', 'Manufacturing'),
        ('services', 'Services'),
        ('technology', 'Technology'),
        ('retail', 'Retail'),
        ('construction', 'Construction'),
        ('healthcare', 'Healthcare'),
        ('education', 'Education'),
        ('finance', 'Finance'),
        ('other', 'Other'),
    )
    
    investor = models.ForeignKey(Investor, on_delete=models.CASCADE, related_name='criteria')
    
    # Sector focus (can have multiple)
    sectors = models.JSONField(default=list, help_text="List of sector codes")
    
    # Funding range
    min_funding_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    max_funding_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Minimum readiness score
    min_readiness_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Required documents
    required_documents = models.JSONField(default=list, help_text="List of required document types")
    
    # Enterprise size preferences
    preferred_sizes = models.JSONField(default=list, help_text="List of preferred enterprise sizes")
    
    # Additional preferences
    min_years_operation = models.PositiveIntegerField(default=0)
    min_employees = models.PositiveIntegerField(default=0)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Criteria for {self.investor}"

    class Meta:
        verbose_name_plural = "Investor Criteria"


class Match(models.Model):
    """SME-Investor matches"""
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('engaged', 'Engaged'),
        ('completed', 'Completed'),
        ('withdrawn', 'Withdrawn'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    investor = models.ForeignKey(Investor, on_delete=models.CASCADE, related_name='matches')
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE, related_name='matches')
    
    # Matching score (0-100)
    match_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    match_details = models.JSONField(default=dict, help_text="Detailed breakdown of match score")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Investor actions
    investor_approved = models.BooleanField(default=False)
    investor_notes = models.TextField(blank=True, null=True)
    
    # Enterprise actions
    enterprise_accepted = models.BooleanField(default=False)
    enterprise_notes = models.TextField(blank=True, null=True)
    
    # Document requests
    documents_requested = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.enterprise.business_name} <-> {self.investor}"

    class Meta:
        unique_together = ['investor', 'enterprise']
        ordering = ['-match_score', '-created_at']
        verbose_name_plural = "Matches"


class MatchInteraction(models.Model):
    """Track interactions between investor and SME"""
    INTERACTION_TYPES = (
        ('document_request', 'Document Request'),
        ('document_submission', 'Document Submission'),
        ('message', 'Message'),
        ('meeting_request', 'Meeting Request'),
        ('status_change', 'Status Change'),
    )
    
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='interactions')
    initiated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    interaction_type = models.CharField(max_length=30, choices=INTERACTION_TYPES)
    content = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.match} - {self.get_interaction_type_display()}"

    class Meta:
        ordering = ['-created_at']
