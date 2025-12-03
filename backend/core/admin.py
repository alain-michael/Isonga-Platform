from django.contrib import admin
from .models import AuditLog, Notification, UserPreferences, DeletionRequest


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['action', 'model_name', 'object_id', 'user', 'ip_address', 'timestamp']
    list_filter = ['action', 'model_name', 'timestamp']
    search_fields = ['user__username', 'user__email', 'object_id', 'ip_address']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'user__email', 'title', 'message']
    actions = ['mark_as_read']
    
    def mark_as_read(self, request, queryset):
        from django.utils import timezone
        queryset.update(is_read=True, read_at=timezone.now())
    mark_as_read.short_description = "Mark selected notifications as read"


@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    list_display = ['user', 'language', 'email_notifications', 'sms_notifications']
    list_filter = ['language', 'email_notifications', 'sms_notifications']
    search_fields = ['user__username', 'user__email']


@admin.register(DeletionRequest)
class DeletionRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'created_at', 'reviewed_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'user__email', 'reason']
    readonly_fields = ['created_at', 'reviewed_at']
    actions = ['approve_requests', 'reject_requests']
    
    def approve_requests(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='approved', reviewed_by=request.user, reviewed_at=timezone.now())
    approve_requests.short_description = "Approve selected deletion requests"
    
    def reject_requests(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='rejected', reviewed_by=request.user, reviewed_at=timezone.now())
    reject_requests.short_description = "Reject selected deletion requests"
