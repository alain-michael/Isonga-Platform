from django.db import models
from django.contrib.auth import get_user_model
from enterprises.models import Enterprise
import uuid

User = get_user_model()


class Campaign(models.Model):
    """Funding Applications by SMEs"""
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted for Review'),
        ('revision_required', 'Revision Required'),
        ('approved', 'Approved'),
        ('active', 'Active - Partner Visible'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
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
    
    # Vetting/Approval
    is_vetted = models.BooleanField(default=False)
    vetted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='vetted_campaigns')
    vetted_at = models.DateTimeField(null=True, blank=True)
    vetting_notes = models.TextField(blank=True, null=True)
    
    # Revision tracking
    revision_notes = models.TextField(blank=True, null=True, help_text="Notes for SME when revision is required")
    revision_count = models.PositiveIntegerField(default=0)
    
    # Readiness score at time of submission (captured from assessment)
    readiness_score_at_submission = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
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


class CampaignUpdate(models.Model):
    """Updates posted by enterprises about their campaigns"""
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='updates')
    title = models.CharField(max_length=255)
    content = models.TextField()
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaign_updates')
    posted_at = models.DateTimeField(auto_now_add=True)
    is_milestone = models.BooleanField(default=False, help_text="Mark as important milestone")
    
    def __str__(self):
        return f"{self.campaign.title} - {self.title}"
    
    class Meta:
        ordering = ['-posted_at']


class CampaignMessage(models.Model):
    """Messages between enterprise and investor regarding a campaign"""
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_campaign_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_campaign_messages')
    interest = models.ForeignKey(CampaignInterest, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.sender} -> {self.receiver} on {self.campaign.title}"
    
    class Meta:
        ordering = ['created_at']
