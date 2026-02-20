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
    partner_name = models.CharField(max_length=255, blank=True, null=True, help_text="Name of the partner contact person")
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
    
    # Auto-screening rules
    auto_reject_below_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Automatically reject applications below this readiness score"
    )
    
    # Revenue preferences
    preferred_revenue_range = models.JSONField(
        default=dict, 
        blank=True,
        help_text="Preferred revenue range: {min: X, max: Y}"
    )
    
    # Required documents (structured format)
    required_documents = models.JSONField(
        default=list, 
        help_text="Array of document requirements: [{name: 'Financial Statements', type: 'financial_statement', required: True, description: '...'}]"
    )
    
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
    campaign = models.ForeignKey('campaigns.Campaign', on_delete=models.CASCADE, related_name='matches')
    
    # Matching score (0-100)
    match_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    match_details = models.JSONField(default=dict, help_text="Detailed breakdown of match score")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Investor actions
    investor_approved = models.BooleanField(default=False)
    investor_notes = models.TextField(blank=True, null=True)
    
    # Investment commitment (from CampaignInterest)
    committed_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    committed_at = models.DateTimeField(null=True, blank=True)
    
    # Payment confirmation
    payment_received = models.BooleanField(default=False)
    payment_received_at = models.DateTimeField(null=True, blank=True)
    
    # Enterprise actions
    enterprise_accepted = models.BooleanField(default=False)
    enterprise_notes = models.TextField(blank=True, null=True)
    
    # Document requests
    documents_requested = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        campaign_info = f" - {self.campaign.title}" if self.campaign else ""
        return f"{self.enterprise.business_name} <-> {self.investor}{campaign_info}"

    class Meta:
        unique_together = ['investor', 'campaign']
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


class PartnerFundingForm(models.Model):
    """Partner-specific funding application form template"""
    FUNDING_TYPES = (
        ('loan', 'Loan'),
        ('equity', 'Equity Investment'),
        ('grant', 'Grant'),
        ('hybrid', 'Hybrid'),
    )
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('archived', 'Archived'),
    )
    
    partner = models.ForeignKey(Investor, on_delete=models.CASCADE, related_name='funding_forms')
    name = models.CharField(max_length=255, help_text="e.g., BK SME Loan Application")
    description = models.TextField(blank=True)
    funding_type = models.CharField(max_length=20, choices=FUNDING_TYPES)
    
    # Scoring override
    min_readiness_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Override partner's default min readiness score for this form"
    )
    
    # Form status and versioning
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    version = models.CharField(max_length=10, default='1.0')
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_funding_forms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['partner', 'name', 'version']
    
    def __str__(self):
        return f"{self.partner.organization_name} - {self.name} v{self.version}"


class FormSection(models.Model):
    """Organize funding form into sections"""
    form = models.ForeignKey(PartnerFundingForm, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.form.name} - {self.title}"


class FormField(models.Model):
    """Individual form fields/questions in a section"""
    FIELD_TYPES = (
        ('text', 'Short Text'),
        ('long_text', 'Long Text / Paragraph'),
        ('number', 'Number'),
        ('choice', 'Multiple Choice'),
        ('file', 'File Upload'),
        ('auto_fill', 'Auto-filled from Profile/Assessment'),
    )
    
    section = models.ForeignKey(FormSection, on_delete=models.CASCADE, related_name='fields')
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)
    label = models.CharField(max_length=255)
    help_text = models.TextField(blank=True)
    is_required = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    # For number fields
    min_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    max_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # For choice fields (stored as JSON array)
    choices = models.JSONField(
        default=list, 
        blank=True,
        help_text="Array of choice objects: [{value: 'x', label: 'X'}]"
    )
    
    # For file uploads
    accepted_file_types = models.JSONField(
        default=list,
        blank=True,
        help_text="Array of accepted file extensions: ['.pdf', '.docx']"
    )
    max_file_size_mb = models.PositiveIntegerField(null=True, blank=True)
    
    # Auto-fill configuration
    auto_fill_source = models.CharField(
        max_length=255,
        blank=True,
        help_text="Dot notation for data source: 'profile.business_name', 'assessment.readiness_score'"
    )
    
    # Conditional logic (show/hide based on other field values)
    conditional_rules = models.JSONField(
        default=dict,
        blank=True,
        help_text="Rules to show/hide field: {show_if: {field: 'loan_amount', operator: '>', value: 10000000}}"
    )
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.section.form.name} - {self.label}"
