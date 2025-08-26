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
    
    ENTERPRISE_SIZES = (
        ('micro', 'Micro (1-4 employees)'),
        ('small', 'Small (5-30 employees)'),
        ('medium', 'Medium (31-100 employees)'),
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
    enterprise_size = models.CharField(max_length=50, choices=ENTERPRISE_SIZES)
    sector = models.CharField(max_length=50, choices=SECTORS)
    
    # Contact Information
    address = models.TextField()
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    website = models.URLField(blank=True, null=True)
    
    # Business Information
    year_established = models.PositiveIntegerField()
    number_of_employees = models.PositiveIntegerField()
    annual_revenue = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Verification Status
    is_vetted = models.BooleanField(default=False)
    vetted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='vetted_enterprises')
    vetted_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.business_name} ({self.tin_number})"
    
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
    
    # Financial data extracted from documents
    extracted_revenue = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    extracted_profit = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    extracted_assets = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    extracted_liabilities = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    
    def __str__(self):
        return f"{self.enterprise.business_name} - {self.title}"
    
    class Meta:
        ordering = ['-uploaded_at']
