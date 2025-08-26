from rest_framework import serializers
from .models import SubscriptionPlan, Subscription, Payment

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class SubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    enterprise_name = serializers.CharField(source='enterprise.business_name', read_only=True)
    
    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ['is_active']

class PaymentSerializer(serializers.ModelSerializer):
    enterprise_name = serializers.CharField(source='enterprise.business_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
