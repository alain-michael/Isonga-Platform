from django.contrib import admin
from .models import Campaign, CampaignDocument, CampaignInterest, CampaignUpdate, CampaignMessage


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['title', 'enterprise', 'campaign_type', 'status', 
                    'target_amount', 'amount_raised', 'is_vetted', 'created_at']
    list_filter = ['status', 'campaign_type', 'is_vetted', 'created_at']
    search_fields = ['title', 'enterprise__business_name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'vetted_at']
    actions = ['approve_campaigns', 'vet_campaigns']
    
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
    readonly_fields = ['created_at']
