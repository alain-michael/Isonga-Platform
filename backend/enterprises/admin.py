from django.contrib import admin
from .models import Enterprise, EnterpriseDocument

@admin.register(Enterprise)
class EnterpriseAdmin(admin.ModelAdmin):
    list_display = ['business_name', 'tin_number', 'enterprise_type', 'sector', 'province', 'is_vetted', 'created_at']
    list_filter = ['enterprise_type', 'management_structure', 'sector', 'province', 'is_vetted', 'created_at']
    search_fields = ['business_name', 'tin_number', 'email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'business_name', 'tin_number', 'registration_number')
        }),
        ('Business Details', {
            'fields': ('enterprise_type', 'management_structure', 'sector', 'year_established', 'number_of_employees', 'annual_revenue', 'description')
        }),
        ('Location', {
            'fields': ('province', 'district', 'phone', 'email', 'website')
        }),
        ('Verification', {
            'fields': ('is_vetted', 'vetted_by', 'vetted_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(EnterpriseDocument)
class EnterpriseDocumentAdmin(admin.ModelAdmin):
    list_display = ['enterprise', 'document_type', 'title', 'fiscal_year', 'uploaded_at']
    list_filter = ['document_type', 'fiscal_year', 'uploaded_at']
    search_fields = ['enterprise__business_name', 'title']
