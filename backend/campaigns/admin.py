from django.contrib import admin
from .models import Campaign, CampaignDocument, CampaignInterest


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
