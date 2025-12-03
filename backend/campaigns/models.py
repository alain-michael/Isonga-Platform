from django.db import models
from django.contrib.auth import get_user_model
from enterprises.models import Enterprise
import uuid

User = get_user_model()


class Campaign(models.Model):
    """Fundraising/Investment campaigns by SMEs"""
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted for Review'),
        ('vetted', 'Vetted'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    CAMPAIGN_TYPES = (
        ('equity', 'Equity Investment'),
        ('debt', 'Debt Financing'),
        ('grant', 'Grant'),
        ('hybrid', 'Hybrid'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE, related_name='campaigns')
    
    # Campaign details
    title = models.CharField(max_length=255)
    description = models.TextField()
    campaign_type = models.CharField(max_length=20, choices=CAMPAIGN_TYPES)
    
    # Funding goals
    target_amount = models.DecimalField(max_digits=15, decimal_places=2)
    min_investment = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    max_investment = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    
    # Current progress
    amount_raised = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    investor_count = models.PositiveIntegerField(default=0)
    
    # Timeline
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Vetting
    is_vetted = models.BooleanField(default=False)
    vetted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='vetted_campaigns')
    vetted_at = models.DateTimeField(null=True, blank=True)
    vetting_notes = models.TextField(blank=True, null=True)
    
    # Use of funds
    use_of_funds = models.JSONField(default=dict, help_text="Breakdown of how funds will be used")
    
    # Metrics
    views_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.enterprise.business_name}"

    @property
    def progress_percentage(self):
        if self.target_amount > 0:
            return (self.amount_raised / self.target_amount) * 100
        return 0

    class Meta:
        ordering = ['-created_at']


class CampaignDocument(models.Model):
    """Documents attached to campaigns"""
    DOCUMENT_TYPES = (
        ('pitch_deck', 'Pitch Deck'),
        ('business_plan', 'Business Plan'),
        ('financial_projection', 'Financial Projection'),
        ('term_sheet', 'Term Sheet'),
        ('other', 'Other'),
    )
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='campaign_documents/')
    description = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=False, help_text="Visible to all investors")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.campaign.title} - {self.title}"

    class Meta:
        ordering = ['-uploaded_at']


class CampaignInterest(models.Model):
    """Investor interest in campaigns"""
    STATUS_CHOICES = (
        ('interested', 'Interested'),
        ('committed', 'Committed'),
        ('invested', 'Invested'),
        ('withdrawn', 'Withdrawn'),
    )
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='interests')
    investor = models.ForeignKey('investors.Investor', on_delete=models.CASCADE, related_name='campaign_interests')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='interested')
    interest_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    committed_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    invested_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.investor} -> {self.campaign.title}"

    class Meta:
        unique_together = ['campaign', 'investor']
        ordering = ['-created_at']
