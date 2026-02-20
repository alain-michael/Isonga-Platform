from django.contrib import admin
from .models import Campaign, CampaignDocument, CampaignInterest, CampaignUpdate, CampaignMessage, CampaignPartnerApplication


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['title', 'enterprise', 'campaign_type', 'status', 
                    'target_amount', 'amount_raised', 'is_vetted', 'target_partners_count', 'created_at']
    list_filter = ['status', 'campaign_type', 'is_vetted', 'created_at']
    search_fields = ['title', 'enterprise__business_name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'vetted_at']
    filter_horizontal = ['target_partners']
    actions = ['approve_campaigns', 'vet_campaigns']
    
    def target_partners_count(self, obj):
        return obj.target_partners.count()
    target_partners_count.short_description = 'Targeted Partners'
    
    def approve_campaigns(self, request, queryset):
        queryset.update(status='active')
    approve_campaigns.short_description = "Approve selected campaigns"
    
    def vet_campaigns(self, request, queryset):
        from django.utils import timezone
        queryset.update(is_vetted=True, vetted_by=request.user, vetted_at=timezone.now())
    vet_campaigns.short_description = "Mark selected campaigns as vetted"


@admin.register(CampaignDocument)
class CampaignDocumentAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'document_type', 'title', 'is_public', 'uploaded_at']
    list_filter = ['document_type', 'is_public', 'uploaded_at']
    search_fields = ['title', 'campaign__title']


@admin.register(CampaignInterest)
class CampaignInterestAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'investor', 'interest_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['campaign__title', 'investor__organization_name']


@admin.register(CampaignUpdate)
class CampaignUpdateAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'title', 'posted_by', 'is_milestone', 'posted_at']
    list_filter = ['is_milestone', 'posted_at']
    search_fields = ['title', 'content', 'campaign__title']
    readonly_fields = ['posted_at']


@admin.register(CampaignMessage)
class CampaignMessageAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'sender', 'receiver', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['content', 'campaign__title', 'sender__email', 'receiver__email']


@admin.register(CampaignPartnerApplication)
class CampaignPartnerApplicationAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'partner', 'status', 'auto_screen_passed', 'proposed_amount', 'submitted_at', 'created_at']
    list_filter = ['status', 'auto_screened', 'auto_screen_passed', 'conditions_met', 'created_at']
    search_fields = ['campaign__title', 'partner__organization_name', 'review_notes']
    readonly_fields = ['created_at', 'updated_at', 'reviewed_at', 'submitted_at', 'auto_screened', 'auto_screen_passed', 'auto_screen_reason']
    actions = ['approve_applications', 'decline_applications']
    
    fieldsets = (
        ('Application Details', {
            'fields': ('campaign', 'partner', 'funding_form', 'status')
        }),
        ('Form Responses', {
            'fields': ('form_responses',),
            'classes': ('collapse',)
        }),
        ('Auto-Screening', {
            'fields': ('auto_screened', 'auto_screen_passed', 'auto_screen_reason'),
            'classes': ('collapse',)
        }),
        ('Review', {
            'fields': ('reviewed_by', 'reviewed_at', 'review_notes')
        }),
        ('Approval Details', {
            'fields': ('approval_conditions', 'conditions_met', 'proposed_amount', 'proposed_terms'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('submitted_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def approve_applications(self, request, queryset):
        queryset.update(status='approved')
    approve_applications.short_description = "Approve selected applications"
    
    def decline_applications(self, request, queryset):
        queryset.update(status='declined')
    decline_applications.short_description = "Decline selected applications"
    readonly_fields = ['created_at']
