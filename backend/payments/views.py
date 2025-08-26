from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from .models import SubscriptionPlan, Subscription, Payment
from .serializers import SubscriptionPlanSerializer, SubscriptionSerializer, PaymentSerializer
from enterprises.models import Enterprise

class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'enterprise':
            try:
                enterprise = user.enterprise
                return Subscription.objects.filter(enterprise=enterprise)
            except Enterprise.DoesNotExist:
                return Subscription.objects.none()
        elif user.user_type in ['admin', 'superadmin']:
            return Subscription.objects.all()
        return Subscription.objects.none()
    
    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        """Create a new subscription"""
        if request.user.user_type != 'enterprise':
            return Response({'error': 'Only enterprises can subscribe'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            enterprise = request.user.enterprise
        except Enterprise.DoesNotExist:
            return Response({'error': 'Enterprise profile not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({'error': 'Plan ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({'error': 'Plan not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if enterprise already has an active subscription
        active_subscription = Subscription.objects.filter(
            enterprise=enterprise,
            status='active',
            end_date__gt=timezone.now()
        ).first()
        
        if active_subscription:
            return Response({'error': 'You already have an active subscription'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create subscription
        start_date = timezone.now()
        end_date = start_date + timedelta(days=plan.duration_months * 30)
        
        subscription = Subscription.objects.create(
            enterprise=enterprise,
            plan=plan,
            start_date=start_date,
            end_date=end_date,
            status='pending'
        )
        
        return Response(SubscriptionSerializer(subscription).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a subscription (after payment)"""
        subscription = get_object_or_404(Subscription, pk=pk)
        
        # Check permissions
        if (request.user.user_type == 'enterprise' and subscription.enterprise.user != request.user and
            request.user.user_type not in ['admin', 'superadmin']):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        subscription.status = 'active'
        subscription.save()
        
        return Response({'message': 'Subscription activated successfully'})

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'enterprise':
            try:
                enterprise = user.enterprise
                return Payment.objects.filter(enterprise=enterprise)
            except Enterprise.DoesNotExist:
                return Payment.objects.none()
        elif user.user_type in ['admin', 'superadmin']:
            return Payment.objects.all()
        return Payment.objects.none()
    
    @action(detail=False, methods=['post'])
    def create_payment(self, request):
        """Create a payment for a subscription"""
        subscription_id = request.data.get('subscription_id')
        payment_method = request.data.get('payment_method', 'stripe')
        
        if not subscription_id:
            return Response({'error': 'Subscription ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            subscription = Subscription.objects.get(id=subscription_id)
        except Subscription.DoesNotExist:
            return Response({'error': 'Subscription not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check permissions
        if (request.user.user_type == 'enterprise' and subscription.enterprise.user != request.user):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        payment = Payment.objects.create(
            subscription=subscription,
            enterprise=subscription.enterprise,
            amount=subscription.plan.price,
            payment_method=payment_method,
            status='pending'
        )
        
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        """Confirm a payment (webhook or manual confirmation)"""
        payment = get_object_or_404(Payment, pk=pk)
        
        payment.status = 'completed'
        payment.save()
        
        # Activate the subscription
        subscription = payment.subscription
        subscription.status = 'active'
        subscription.save()
        
        return Response({'message': 'Payment confirmed and subscription activated'})
