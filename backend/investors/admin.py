from django.contrib import admin
from .models import Investor, InvestorCriteria, Match, MatchInteraction, PartnerFundingForm, FormSection, FormField


class FormFieldInline(admin.TabularInline):
    model = FormField
    extra = 1
    fields = ['field_type', 'label', 'is_required', 'order', 'help_text']


class FormSectionInline(admin.StackedInline):
    model = FormSection
    extra = 1
    fields = ['title', 'description', 'order']
    show_change_link = True


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


@admin.register(PartnerFundingForm)
class PartnerFundingFormAdmin(admin.ModelAdmin):
    list_display = ['name', 'partner', 'funding_type', 'status', 'version', 'created_at']
    list_filter = ['funding_type', 'status', 'created_at']
    search_fields = ['name', 'partner__organization_name']
    readonly_fields = ['created_by', 'created_at', 'updated_at']
    inlines = [FormSectionInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('partner', 'name', 'description', 'funding_type')
        }),
        ('Configuration', {
            'fields': ('min_readiness_score', 'status', 'version')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(FormSection)
class FormSectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'form', 'order']
    list_filter = ['form']
    search_fields = ['title', 'form__name']
    inlines = [FormFieldInline]


@admin.register(FormField)
class FormFieldAdmin(admin.ModelAdmin):
    list_display = ['label', 'section', 'field_type', 'is_required', 'order']
    list_filter = ['field_type', 'is_required', 'section__form']
    search_fields = ['label', 'section__title']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('section', 'field_type', 'label', 'help_text', 'is_required', 'order')
        }),
        ('Number Field Settings', {
            'fields': ('min_value', 'max_value'),
            'classes': ('collapse',)
        }),
        ('Choice Field Settings', {
            'fields': ('choices',),
            'classes': ('collapse',)
        }),
        ('File Field Settings', {
            'fields': ('accepted_file_types', 'max_file_size_mb'),
            'classes': ('collapse',)
        }),
        ('Auto-fill Settings', {
            'fields': ('auto_fill_source',),
            'classes': ('collapse',)
        }),
        ('Conditional Logic', {
            'fields': ('conditional_rules',),
            'classes': ('collapse',)
        }),
    )
