from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Enterprise(models.Model):
    ENTERPRISE_TYPES = (
        ('sole_proprietorship', 'Sole Proprietorship'),
        ('partnership', 'Partnership'),
        ('limited_company', 'Limited Company'),
        ('cooperative', 'Cooperative'),
        ('ngo', 'NGO'),
    )
    
    # Replaced enterprise_size with management_structure
    MANAGEMENT_STRUCTURES = (
        ('owner_managed', 'Owner-managed'),
        ('professional_management', 'Professional Management'),
    )
    
    PROVINCES = (
        ('kigali_city', 'Kigali City'),
        ('eastern', 'Eastern Province'),
        ('western', 'Western Province'),
        ('northern', 'Northern Province'),
        ('southern', 'Southern Province'),
    )
    
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
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='enterprise')
    business_name = models.CharField(max_length=255)
    tin_number = models.CharField(max_length=50, unique=True)
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    enterprise_type = models.CharField(max_length=50, choices=ENTERPRISE_TYPES)
    management_structure = models.CharField(max_length=50, choices=MANAGEMENT_STRUCTURES, default='owner_managed')
    sector = models.CharField(max_length=50, choices=SECTORS)
    
    # Contact Information - removed address and city, added province
    province = models.CharField(max_length=50, choices=PROVINCES, default='kigali_city')
    district = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)  # Made optional
    website = models.URLField(blank=True, null=True)
    
    # Business Information
    year_established = models.PositiveIntegerField()
    number_of_employees = models.PositiveIntegerField()
    annual_revenue = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Verification Status
    VERIFICATION_STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('documents_requested', 'Documents Requested'),
    )
    
    verification_status = models.CharField(
        max_length=20, 
        choices=VERIFICATION_STATUS_CHOICES, 
        default='pending'
    )
    is_vetted = models.BooleanField(default=False)  # Keep for backward compatibility
    vetted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='vetted_enterprises')
    vetted_at = models.DateTimeField(null=True, blank=True)
    verification_notes = models.TextField(blank=True, null=True, help_text="Admin notes about verification status")
    documents_requested = models.TextField(blank=True, null=True, help_text="Specific documents requested from enterprise")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.business_name} ({self.tin_number})"
    
    @property
    def is_approved(self):
        return self.verification_status == 'approved'
    
    @property
    def is_rejected(self):
        return self.verification_status == 'rejected'
    
    @property
    def needs_documents(self):
        return self.verification_status == 'documents_requested'
    
    class Meta:
        ordering = ['-created_at']

class EnterpriseDocument(models.Model):
    DOCUMENT_TYPES = (
        ('registration_certificate', 'Registration Certificate'),
        ('tax_clearance', 'Tax Clearance'),
        ('business_license', 'Business License'),
        ('financial_statement', 'Financial Statement'),
        ('bank_statement', 'Bank Statement'),
        ('audit_report', 'Audit Report'),
        ('other', 'Other'),
    )
    
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='enterprise_documents/')
    fiscal_year = models.PositiveIntegerField()
    description = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # Document verification
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_documents')
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_notes = models.TextField(blank=True, null=True)
    
    # Financial data extracted from documents
    extracted_revenue = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    extracted_profit = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    extracted_assets = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    extracted_liabilities = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    
    def __str__(self):
        return f"{self.enterprise.business_name} - {self.title}"
    
    class Meta:
        ordering = ['-uploaded_at']


# ─── Business Profile Forms ────────────────────────────────────────────────────

class BusinessProfileForm(models.Model):
    """
    Admin-created form template for a specific sector.
    Replaces the fixed profile fields; the admin decides what fields
    each sector's profile contains.
    """
    SECTORS = Enterprise.SECTORS   # reuse sector choices from Enterprise

    sector = models.CharField(
        max_length=50, choices=SECTORS, unique=True,
        help_text="One form template per sector"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_profile_forms'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile Form – {self.get_sector_display()}"

    class Meta:
        ordering = ['sector']


class BusinessProfileSection(models.Model):
    """Section grouping within a BusinessProfileForm."""
    form = models.ForeignKey(BusinessProfileForm, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.form} – {self.title}"


class BusinessProfileField(models.Model):
    """Individual field inside a BusinessProfileSection."""
    FIELD_TYPES = (
        ('text', 'Short Text'),
        ('long_text', 'Long Text / Paragraph'),
        ('number', 'Number'),
        ('choice', 'Multiple Choice (single)'),
        ('multi_choice', 'Multiple Choice (multi)'),
        ('date', 'Date'),
        ('file', 'File Upload'),
        # Special type: value is auto-populated from the Enterprise model field
        ('auto_fill', 'Auto-fill from Profile'),
    )

    section = models.ForeignKey(BusinessProfileSection, on_delete=models.CASCADE, related_name='fields')
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)
    label = models.CharField(max_length=255)
    help_text = models.TextField(blank=True)
    placeholder = models.CharField(max_length=255, blank=True)
    is_required = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    # For number fields
    min_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    max_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)

    # For choice / multi_choice fields
    choices = models.JSONField(
        default=list, blank=True,
        help_text="[{value: 'x', label: 'X'}, ...]"
    )

    # For file fields
    accepted_file_types = models.JSONField(
        default=list, blank=True,
        help_text="['.pdf', '.docx', ...]"
    )
    max_file_size_mb = models.PositiveIntegerField(null=True, blank=True)

    # For auto_fill fields – dot-notation path on the Enterprise model
    # e.g. 'business_name', 'tin_number', 'sector', 'province'
    auto_fill_source = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.section.form} – {self.label}"


class EnterpriseProfileFormResponse(models.Model):
    """
    Stores an enterprise's answers to its sector's BusinessProfileForm.
    The `responses` JSON maps field IDs to submitted values.
    File-type answers store paths (handled via separate upload endpoint).
    """
    enterprise = models.OneToOneField(
        Enterprise, on_delete=models.CASCADE,
        related_name='profile_form_response'
    )
    form = models.ForeignKey(
        BusinessProfileForm, on_delete=models.SET_NULL, null=True,
        related_name='enterprise_responses'
    )
    # { "<field_id>": <value> }
    responses = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile response – {self.enterprise.business_name}"
