from django.contrib import admin
from .models import Investor, InvestorCriteria, Match, MatchInteraction


@admin.register(Investor)
class InvestorAdmin(admin.ModelAdmin):
    list_display = ['organization_name', 'investor_type', 'user', 'is_active', 'created_at']
    list_filter = ['investor_type', 'is_active', 'created_at']
    search_fields = ['organization_name', 'user__email', 'user__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(InvestorCriteria)
class InvestorCriteriaAdmin(admin.ModelAdmin):
    list_display = ['investor', 'min_funding_amount', 'max_funding_amount', 'min_readiness_score', 'is_active']
    list_filter = ['is_active', 'created_at']


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['enterprise', 'investor', 'match_score', 'status', 'created_at']
    list_filter = ['status', 'investor_approved', 'enterprise_accepted', 'created_at']
    search_fields = ['enterprise__business_name', 'investor__organization_name']


@admin.register(MatchInteraction)
class MatchInteractionAdmin(admin.ModelAdmin):
    list_display = ['match', 'interaction_type', 'initiated_by', 'created_at']
    list_filter = ['interaction_type', 'created_at']
