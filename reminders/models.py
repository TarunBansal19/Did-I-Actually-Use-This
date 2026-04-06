from django.db import models
from django.conf import settings
from subscriptions.models import Subscription
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class UserReminderPreference(models.Model):
    """Per-user reminder settings: which days and whether reminders are on."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='reminder_preference')
    reminders_enabled = models.BooleanField(default=True)
    reminder_days = models.CharField(max_length=32, default='7,3,1')  # e.g. "7,3,1"

    def get_reminder_days_list(self):
        try:
            return [int(d.strip()) for d in self.reminder_days.split(',') if d.strip()]
        except (ValueError, AttributeError):
            return [7, 3, 1]


class SubscriptionReminder(models.Model):
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name='reminders'
    )
    sent_at = models.DateTimeField(blank = True , null=True)
    days_before = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('subscription' , 'days_before') #Ensure no duplicate reminders for the same subscription and days_before
    
    def __str__(self):
        return f"Reminder for {self.subscription.name}  ({self.days_before} days before)"
    
    @property # by adding this decorator we can call this method as an attribute
    def is_sent(self):
        return self.sent_at is not None
    
    # we wont do @property here as it is used for reading values methods not for setting values methods
    def mark_as_sent(self):
        self.sent_at = timezone.now()
        self.save(update_fields=['sent_at'])

        