from django.core.management.base import BaseCommand
from reminders.models import SubscriptionReminder
from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Q
from subscriptions.models import Subscription
from django.db.models import Count

class Command(BaseCommand):
    help = 'Send renewal reminders for subscriptions'

    def handle(self , *args , **options):
        today = now().date()
        days_to_check = 7
        target_renewal_date = today + timedelta(days = days_to_check)
        month_start = today.replace(day=1)
        
        #Optimized Query
        subs_to_remind = Subscription.objects.filter(
            is_active = True,
            renewal_date = target_renewal_date
        ).annotate( #annote () here is adding a new calculated field 'usage_this_month' to each subscription object
            usage_this_month = Count(
                'usage_logs',
                filter = Q(usage_logs__used_on__range = [month_start , today]),
            )
        ).select_related('user') # to avoid N+1 query problem when accessing subscription.user later

        for sub in subs_to_remind:
            reminder , created = SubscriptionReminder.objects.get_or_create(
                subscription = sub,
                days_before = days_to_check,
            )

            if reminder.is_sent:
                continue #Skip is already sent

            #Simulate sending reminder
            message = f"Hey ! Your subscription '{sub.name}' renews in {days_to_check} days."

            if sub.usage_this_month == 0:
                message += " You haven't used your subscription this month. Want to cancel it?"
            else:
                message += f"You've used your subscription {sub.usage_this_month} times this month. Keep it up!"
            
            self.stdout.write(self.style.SUCCESS(f"Sending : {message} to {sub.user.email}"))

            #Mark reminder as sent
            reminder.mark_as_sent()
        
        self.stdout.write(self.style.SUCCESS("Renewal reminders processing completed."))

