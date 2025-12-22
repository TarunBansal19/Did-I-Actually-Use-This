from django.db import models
from subscriptions.models import Subscription
# Create your models here.

class UsageLog(models.Model):
    subscription = models.ForeignKey(Subscription , on_delete = models.CASCADE , related_name = 'usage_logs')
    used_on = models.DateField()
    created_at = models.DateTimeField(auto_now_add = True)

    class Meta:
         constraints = [
            models.UniqueConstraint(
                fields=['subscription', 'used_on'],
                name='unique_usage_per_day'
            )
        ]
    
    def __str__(self):
        return f"{self.subscription.name} used on {self.used_on}"