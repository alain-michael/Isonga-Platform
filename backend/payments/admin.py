from django.contrib import admin
from .models import SubscriptionPlan, Subscription, Payment

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'duration_months', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['enterprise', 'plan', 'status', 'start_date', 'end_date', 'is_active']
    list_filter = ['status', 'plan', 'start_date']
    search_fields = ['enterprise__business_name']
    readonly_fields = ['is_active']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'enterprise', 'amount', 'currency', 'payment_method', 'status', 'created_at']
    list_filter = ['status', 'payment_method', 'currency', 'created_at']
    search_fields = ['enterprise__business_name', 'transaction_reference']
    readonly_fields = ['id', 'created_at', 'updated_at']
