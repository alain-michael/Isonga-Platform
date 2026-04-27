from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Campaign, CampaignInterest, CampaignMessage


def _notify(user, notification_type, title, message, action_url=None, metadata=None):
    """Create an in-app notification for a user."""
    try:
        from core.models import Notification
        Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            action_url=action_url or '',
            metadata=metadata or {},
        )
    except Exception as e:
        # Never let a notification failure break the main flow
        print(f"[signals] Failed to create notification: {e}")


@receiver(post_save, sender=Campaign)
def on_campaign_status_change(sender, instance, created, **kwargs):
    """Notify the enterprise owner when admin changes campaign status."""
    if created:
        return

    enterprise_user = instance.enterprise.user

    status_map = {
        'submitted': (
            'Application Submitted',
            'Your funding application is now under admin review.',
        ),
        'approved': (
            'Application Approved!',
            f'"{instance.title}" has been approved. Activate it to make it visible to partners.',
        ),
        'active': (
            'Application is Live',
            f'"{instance.title}" is now active and visible to targeted funding partners.',
        ),
        'revision_required': (
            'Revision Required',
            f'Admin has requested changes to "{instance.title}". Check the revision notes.',
        ),
        'rejected': (
            'Application Rejected',
            f'"{instance.title}" was not approved. See the admin notes for details.',
        ),
        'completed': (
            'Application Completed',
            f'"{instance.title}" has been marked as completed.',
        ),
    }

    if instance.status in status_map:
        title, msg = status_map[instance.status]
        _notify(
            enterprise_user,
            'campaign_status',
            title,
            msg,
            action_url=f'/campaigns/{instance.id}',
        )


@receiver(post_save, sender=CampaignInterest)
def on_interest_status_change(sender, instance, created, **kwargs):
    """
    Notify the relevant party when a CampaignInterest is created or changes status.
    """
    try:
        enterprise_user = instance.campaign.enterprise.user
        investor_user = instance.investor.user
    except Exception:
        return

    if created:
        # New interest — notify the enterprise
        org_name = getattr(instance.investor, 'organization_name', 'An investor')
        _notify(
            enterprise_user,
            'investor_interest',
            'New Investor Interest',
            f'{org_name} expressed interest in "{instance.campaign.title}".',
            action_url=f'/campaigns/{instance.campaign.id}',
            metadata={'investor_id': instance.investor.id},
        )
        return

    status = instance.status

    if status in ('pledged', 'committed'):
        amount = instance.committed_amount
        amount_str = f'{float(amount):,.0f} RWF' if amount else 'an amount'
        org_name = getattr(instance.investor, 'organization_name', 'An investor')
        _notify(
            enterprise_user,
            'pledge_received',
            'Pledge Received',
            f'{org_name} pledged {amount_str} for "{instance.campaign.title}". Accept or decline in your application.',
            action_url=f'/campaigns/{instance.campaign.id}',
            metadata={
                'interest_id': instance.id,
                'amount': str(amount),
                'investor_id': instance.investor.id,
            },
        )

    elif status == 'accepted':
        _notify(
            investor_user,
            'pledge_accepted',
            'Pledge Accepted!',
            f'Your pledge for "{instance.campaign.title}" was accepted by the enterprise.',
            action_url='/investor/matches',
            metadata={'campaign_id': str(instance.campaign.id)},
        )

    elif status == 'declined':
        _notify(
            investor_user,
            'pledge_declined',
            'Pledge Declined',
            f'Your pledge for "{instance.campaign.title}" was declined by the enterprise.',
            action_url='/investor/matches',
            metadata={'campaign_id': str(instance.campaign.id)},
        )


@receiver(post_save, sender=CampaignMessage)
def on_new_message(sender, instance, created, **kwargs):
    """Notify the receiver of a new campaign message."""
    if not created:
        return
    try:
        sender_name = (
            instance.sender.get_full_name()
            or instance.sender.email
            or 'Someone'
        )
        _notify(
            instance.receiver,
            'new_message',
            'New Message',
            f'{sender_name} sent you a message about "{instance.campaign.title}".',
            action_url=f'/campaigns/{instance.campaign.id}',
            metadata={'campaign_id': str(instance.campaign.id)},
        )
    except Exception as e:
        print(f"[signals] Message notification failed: {e}")
