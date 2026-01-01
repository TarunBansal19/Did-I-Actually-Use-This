from django.core.management.base import BaseCommand
from reminders.models import SubscriptionReminder
from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Q, Count
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from subscriptions.models import Subscription
from django.conf import settings
import resend
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
resend.api_key = os.getenv('RESEND_API_KEY')


class Command(BaseCommand):
    help = 'Send renewal reminders for subscriptions'

    def handle(self, *args, **options):
        today = now().date()
        days_to_check = 7
        target_renewal_date = today + timedelta(days=days_to_check)
        month_start = today.replace(day=1)
        
        subs_to_remind = Subscription.objects.filter(
            is_active=True,
            renewal_date=target_renewal_date
        ).annotate(
            usage_this_month=Count(
                'usage_logs',
                filter=Q(usage_logs__used_on__range=[month_start, today]),
            )
        ).select_related('user')

        for sub in subs_to_remind:
            reminder, created = SubscriptionReminder.objects.get_or_create(
                subscription=sub,
                days_before=days_to_check,
            )

            if reminder.is_sent:
                continue 

            # Calculate Monthly Cost
            monthly_cost = (
                sub.cost if sub.billing_frequency == 'monthly'
                else sub.cost / 12
            )

            # Determine Message
            if sub.usage_this_month == 0:
                usage_message = "You haven't used this subscription this month. You may want to cancel it before renewal."
            else:
                usage_message = "Looks like you're getting value from this subscription 👍"

            # Prepare Context for Templates
            context = {
                "user_name": sub.user.username,
                "subscription_name": sub.name,
                "days_before": days_to_check,
                "monthly_cost": round(float(monthly_cost), 2),
                "usage_count": sub.usage_this_month,
                "usage_message": usage_message,
                "manage_url": "https://didiactuallyusethis.com/subscriptions",
            }

            # Safety Check
            if not sub.user.email:
                self.stdout.write(self.style.WARNING(f"Skipping '{sub.name}': No email for user '{sub.user.username}'"))
                continue

            try:
                subject = f"Reminder: Your subscription '{sub.name}' renews in {days_to_check} days"
                
                # 1. Render Plain Text
                text_body = render_to_string("reminders/renewal_email.txt", context)

                # 2. Render HTML
                html_body = render_to_string("reminders/renewal_email.html", context)

                # 3. Create Email Object (Fixed for Resend Sandbox)
                r = resend.Emails.send({
                    # YOU MUST USE THIS SENDER UNTIL YOU VERIFY A DOMAIN
                    "from": "Did I Actually Use This <onboarding@resend.dev>",
                    
                    # IMPORTANT: In Sandbox mode, this MUST be the email you signed up with.
                    # If sub.user.email is different, this line will fail unless you override it.
                    "to": [sub.user.email], 
                    
                    "subject": subject,
                    "html": html_body,
                    "text": text_body,
                })

                self.stdout.write(self.style.SUCCESS(f"Email sent to {sub.user.email} for {sub.name}"))
                reminder.mark_as_sent()

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to send email to {sub.user.email}: {str(e)}"))
        
        self.stdout.write(self.style.SUCCESS("Renewal reminders processing completed."))