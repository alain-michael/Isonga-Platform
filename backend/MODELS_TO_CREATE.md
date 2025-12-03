# Models to Create for Missing Django Apps

## 1. Investors App Models

Create file: `backend/investors/models.py`

```python
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Investor(models.Model):
    """Investor profile model"""
    INVESTOR_TYPES = (
        ('angel', 'Angel Investor'),
        ('vc', 'Venture Capital'),
        ('pe', 'Private Equity'),
        ('corporate', 'Corporate Investor'),
        ('government', 'Government Fund'),
        ('impact', 'Impact Investor'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='investor_profile')
    organization_name = models.CharField(max_length=255)
    investor_type = models.CharField(max_length=20, choices=INVESTOR_TYPES)
    
    # Contact Information
    website = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    
    # Investment Profile
    portfolio_size = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        help_text="Total investment portfolio in USD"
    )
    typical_investment_min = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        help_text="Minimum investment amount in USD"
    )
    typical_investment_max = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        help_text="Maximum investment amount in USD"
    )
    
    # Verification
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='verified_investors'
    )
    
    # Metadata
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.organization_name} ({self.get_investor_type_display()})"
    
    class Meta:
        ordering = ['-created_at']


class InvestorCriteria(models.Model):
    """Investment criteria and preferences for an investor"""
    investor = models.OneToOneField(
        Investor, 
        on_delete=models.CASCADE, 
        related_name='criteria'
    )
    
    # Sector Preferences (stored as JSON array)
    sectors = models.JSONField(
        default=list,
        help_text="List of preferred sectors: agriculture, manufacturing, etc."
    )
    
    # Geographic Preferences
    preferred_countries = models.JSONField(
        default=list,
        help_text="List of preferred countries"
    )
    preferred_regions = models.JSONField(
        default=list,
        help_text="List of preferred regions/provinces"
    )
    
    # Enterprise Size Preferences
    preferred_sizes = models.JSONField(
        default=list,
        help_text="Preferred enterprise sizes: micro, small, medium"
    )
    
    # Financial Criteria
    min_revenue = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        help_text="Minimum annual revenue requirement"
    )
    max_revenue = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        help_text="Maximum annual revenue (or null for no limit)",
        null=True,
        blank=True
    )
    min_employees = models.PositiveIntegerField(default=1)
    max_employees = models.PositiveIntegerField(null=True, blank=True)
    
    # Business Stage
    min_years_operating = models.PositiveIntegerField(
        default=1,
        help_text="Minimum years in operation"
    )
    
    # Assessment Score Requirements
    min_assessment_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=60.0,
        help_text="Minimum readiness assessment score (percentage)"
    )
    
    # Impact Criteria (for impact investors)
    impact_focus = models.JSONField(
        default=list,
        blank=True,
        help_text="Impact areas: job creation, women empowerment, environmental, etc."
    )
    
    # Additional Requirements
    requires_audit = models.BooleanField(
        default=False,
        help_text="Requires audited financial statements"
    )
    requires_tax_clearance = models.BooleanField(
        default=True,
        help_text="Requires tax clearance certificate"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Criteria for {self.investor.organization_name}"
    
    class Meta:
        verbose_name_plural = "Investor Criteria"
```

## 2. Matching App Models

Create file: `backend/matching/models.py`

```python
from django.db import models
from django.contrib.auth import get_user_model
from enterprises.models import Enterprise
from investors.models import Investor

User = get_user_model()

class Match(models.Model):
    """Represents a potential match between an SME and an investor"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('viewed', 'Viewed by Investor'),
        ('interested', 'Investor Interested'),
        ('contacted', 'Contact Initiated'),
        ('in_discussion', 'In Discussion'),
        ('declined', 'Declined'),
        ('closed', 'Closed/Completed'),
    )
    
    enterprise = models.ForeignKey(
        Enterprise, 
        on_delete=models.CASCADE, 
        related_name='matches'
    )
    investor = models.ForeignKey(
        Investor, 
        on_delete=models.CASCADE, 
        related_name='matches'
    )
    
    # Match Quality
    match_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        help_text="Match score out of 100"
    )
    match_reasons = models.JSONField(
        default=dict,
        help_text="Reasons for the match (sector, revenue, location, etc.)"
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_active = models.BooleanField(default=True)
    
    # Visibility Control
    visible_to_enterprise = models.BooleanField(
        default=False,
        help_text="Whether SME can see this investor"
    )
    visible_to_investor = models.BooleanField(
        default=True,
        help_text="Whether investor can see this SME"
    )
    
    # Interaction Tracking
    viewed_by_investor_at = models.DateTimeField(null=True, blank=True)
    viewed_by_enterprise_at = models.DateTimeField(null=True, blank=True)
    investor_notes = models.TextField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    matched_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="User/system that created the match"
    )
    
    def __str__(self):
        return f"{self.enterprise.business_name} <-> {self.investor.organization_name} ({self.match_score}%)"
    
    class Meta:
        unique_together = ['enterprise', 'investor']
        ordering = ['-match_score', '-created_at']
        verbose_name_plural = "Matches"


class MatchInteraction(models.Model):
    """Track interactions related to a match"""
    INTERACTION_TYPES = (
        ('viewed', 'Profile Viewed'),
        ('document_requested', 'Document Requested'),
        ('message_sent', 'Message Sent'),
        ('meeting_scheduled', 'Meeting Scheduled'),
        ('interest_expressed', 'Interest Expressed'),
        ('declined', 'Declined'),
    )
    
    match = models.ForeignKey(
        Match, 
        on_delete=models.CASCADE, 
        related_name='interactions'
    )
    interaction_type = models.CharField(max_length=30, choices=INTERACTION_TYPES)
    initiated_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        help_text="User who initiated the interaction"
    )
    notes = models.TextField(blank=True, null=True)
    metadata = models.JSONField(
        default=dict,
        help_text="Additional data about the interaction"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.get_interaction_type_display()} - {self.match}"
    
    class Meta:
        ordering = ['-created_at']
```

## 3. Communications App Models

Create file: `backend/communications/models.py`

```python
from django.db import models
from django.contrib.auth import get_user_model
from matching.models import Match
from enterprises.models import Enterprise
from investors.models import Investor

User = get_user_model()

class Message(models.Model):
    """Messages between investors and SMEs"""
    match = models.ForeignKey(
        Match, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    sender = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='sent_messages'
    )
    recipient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='received_messages'
    )
    
    subject = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField()
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Attachments (optional)
    attachment = models.FileField(
        upload_to='message_attachments/', 
        blank=True, 
        null=True
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Message from {self.sender.username} to {self.recipient.username}"
    
    class Meta:
        ordering = ['-created_at']


class DocumentRequest(models.Model):
    """Investor requests for specific documents from SME"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('partially_fulfilled', 'Partially Fulfilled'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    )
    
    match = models.ForeignKey(
        Match, 
        on_delete=models.CASCADE, 
        related_name='document_requests'
    )
    investor = models.ForeignKey(
        Investor, 
        on_delete=models.CASCADE, 
        related_name='document_requests'
    )
    enterprise = models.ForeignKey(
        Enterprise, 
        on_delete=models.CASCADE, 
        related_name='document_requests'
    )
    
    # Request Details
    title = models.CharField(max_length=255)
    description = models.TextField(
        help_text="Details about what documents are needed and why"
    )
    requested_documents = models.JSONField(
        default=list,
        help_text="List of document types requested"
    )
    
    # Status
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateTimeField(null=True, blank=True)
    
    # Response
    response_notes = models.TextField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    fulfilled_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Document Request: {self.title} ({self.status})"
    
    class Meta:
        ordering = ['-created_at']


class DocumentResponse(models.Model):
    """SME's response to a document request"""
    request = models.ForeignKey(
        DocumentRequest, 
        on_delete=models.CASCADE, 
        related_name='responses'
    )
    document_type = models.CharField(max_length=100)
    file = models.FileField(upload_to='document_responses/')
    notes = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Response to {self.request.title}"
    
    class Meta:
        ordering = ['-uploaded_at']
```

## 4. Notifications App Models

Create file: `backend/notifications/models.py`

```python
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationTemplate(models.Model):
    """Templates for different types of notifications"""
    NOTIFICATION_TYPES = (
        ('new_match', 'New Match Found'),
        ('investor_viewed', 'Investor Viewed Profile'),
        ('investor_interested', 'Investor Interested'),
        ('message_received', 'New Message Received'),
        ('document_requested', 'Document Requested'),
        ('document_uploaded', 'Document Uploaded'),
        ('assessment_completed', 'Assessment Completed'),
        ('payment_successful', 'Payment Successful'),
        ('payment_failed', 'Payment Failed'),
        ('subscription_expiring', 'Subscription Expiring'),
    )
    
    CHANNELS = (
        ('email', 'Email'),
        ('whatsapp', 'WhatsApp'),
        ('sms', 'SMS'),
        ('in_app', 'In-App Notification'),
    )
    
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, unique=True)
    name = models.CharField(max_length=255)
    
    # Templates for different channels
    email_subject = models.CharField(max_length=255, blank=True, null=True)
    email_body = models.TextField(blank=True, null=True)
    whatsapp_template = models.TextField(blank=True, null=True)
    sms_template = models.TextField(blank=True, null=True)
    in_app_title = models.CharField(max_length=255, blank=True, null=True)
    in_app_body = models.TextField(blank=True, null=True)
    
    # Settings
    enabled_channels = models.JSONField(
        default=list,
        help_text="List of enabled channels for this notification type"
    )
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_notification_type_display()} Template"
    
    class Meta:
        ordering = ['notification_type']


class Notification(models.Model):
    """Individual notifications sent to users"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('read', 'Read'),
    )
    
    CHANNELS = (
        ('email', 'Email'),
        ('whatsapp', 'WhatsApp'),
        ('sms', 'SMS'),
        ('in_app', 'In-App'),
    )
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=50)
    channel = models.CharField(max_length=20, choices=CHANNELS)
    
    # Content
    title = models.CharField(max_length=255)
    content = models.TextField()
    
    # Metadata
    metadata = models.JSONField(
        default=dict,
        help_text="Additional data (e.g., match_id, message_id)"
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    
    # External IDs (for tracking)
    external_id = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="ID from external service (Twilio, SendGrid, etc.)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.get_channel_display()} to {self.user.username}: {self.title}"
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status', '-created_at']),
        ]


class NotificationPreference(models.Model):
    """User preferences for notifications"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='notification_preferences'
    )
    
    # Channel preferences
    email_enabled = models.BooleanField(default=True)
    whatsapp_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    in_app_enabled = models.BooleanField(default=True)
    
    # Notification type preferences (JSON)
    # Example: {"new_match": ["email", "whatsapp"], "message_received": ["in_app"]}
    type_preferences = models.JSONField(
        default=dict,
        help_text="Preferred channels for each notification type"
    )
    
    # Quiet hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Notification Preferences for {self.user.username}"
```

## 5. Audit App Models

Create file: `backend/audit/models.py`

```python
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class AuditLog(models.Model):
    """Comprehensive audit trail for all important actions"""
    ACTION_TYPES = (
        # User Actions
        ('user_login', 'User Login'),
        ('user_logout', 'User Logout'),
        ('user_created', 'User Created'),
        ('user_updated', 'User Updated'),
        ('user_deleted', 'User Deleted'),
        
        # Enterprise Actions
        ('enterprise_created', 'Enterprise Created'),
        ('enterprise_updated', 'Enterprise Updated'),
        ('enterprise_verified', 'Enterprise Verified'),
        ('enterprise_rejected', 'Enterprise Rejected'),
        
        # Document Actions
        ('document_uploaded', 'Document Uploaded'),
        ('document_verified', 'Document Verified'),
        ('document_deleted', 'Document Deleted'),
        
        # Assessment Actions
        ('assessment_started', 'Assessment Started'),
        ('assessment_completed', 'Assessment Completed'),
        ('assessment_reviewed', 'Assessment Reviewed'),
        
        # Payment Actions
        ('payment_initiated', 'Payment Initiated'),
        ('payment_completed', 'Payment Completed'),
        ('payment_failed', 'Payment Failed'),
        ('payment_refunded', 'Payment Refunded'),
        
        # Matching Actions
        ('match_created', 'Match Created'),
        ('match_viewed', 'Match Viewed'),
        ('match_accepted', 'Match Accepted'),
        ('match_declined', 'Match Declined'),
        
        # Admin Actions
        ('admin_access', 'Admin Access'),
        ('settings_changed', 'Settings Changed'),
        ('data_exported', 'Data Exported'),
    )
    
    # Who
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='audit_logs'
    )
    username = models.CharField(
        max_length=150,
        help_text="Stored in case user is deleted"
    )
    
    # What
    action = models.CharField(max_length=50, choices=ACTION_TYPES)
    model_name = models.CharField(
        max_length=100,
        help_text="Django model that was affected"
    )
    object_id = models.CharField(
        max_length=100,
        help_text="ID of the object that was affected"
    )
    object_repr = models.CharField(
        max_length=255,
        help_text="String representation of the object"
    )
    
    # Changes
    changes = models.JSONField(
        default=dict,
        help_text="Before/after values for updates"
    )
    
    # Where
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    
    # When
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Additional context
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.username} - {self.get_action_display()} - {self.object_repr}"
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action', '-created_at']),
            models.Index(fields=['model_name', 'object_id']),
        ]


class DataDeletionRequest(models.Model):
    """Track requests for data deletion (GDPR compliance)"""
    STATUS_CHOICES = (
        ('pending', 'Pending Admin Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='deletion_requests'
    )
    reason = models.TextField(
        help_text="User's reason for deletion request"
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Admin Review
    reviewed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='reviewed_deletion_requests'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True, null=True)
    
    # Completion
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='completed_deletion_requests'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Data Export (before deletion)
    data_export_file = models.FileField(
        upload_to='data_exports/', 
        blank=True, 
        null=True,
        help_text="User's data export provided before deletion"
    )
    
    def __str__(self):
        return f"Deletion Request by {self.user.username} - {self.status}"
    
    class Meta:
        ordering = ['-created_at']
```

---

## Next Steps After Creating Models

1. Create `__init__.py` files in each app directory
2. Create basic `admin.py` files to register models
3. Create `apps.py` files for each app
4. Add apps to `INSTALLED_APPS` in settings
5. Create and run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. Create serializers for each model
7. Create views and URL patterns
8. Create services for business logic
