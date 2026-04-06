from django.core.management.base import BaseCommand
from django.core.signing import Signer
from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Q, Count
from django.template.loader import render_to_string
from subscriptions.models import Subscription
from reminders.models import SubscriptionReminder, UserReminderPreference
from django.conf import settings
import resend
import os
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.getenv('RESEND_API_KEY')
signer = Signer()


class Command(BaseCommand):
    help = 'Send renewal reminders for subscriptions (7, 3, and 1 day before by default)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=str,
            default='7,3,1',
            help='Comma-separated days before renewal to send reminders (e.g. 7,3,1). Default: 7,3,1',
        )

    def handle(self, *args, **options):
        today = now().date()
        days_str = options.get('days', '7,3,1').strip()
        try:
            days_list = [int(d.strip()) for d in days_str.split(',') if d.strip()]
        except ValueError:
            self.stdout.write(self.style.ERROR('Invalid --days; use comma-separated integers (e.g. 7,3,1)'))
            return
        if not days_list:
            days_list = [7, 3, 1]

        month_start = today.replace(day=1)
        site_url = getattr(settings, 'SITE_URL', 'http://localhost:8000').rstrip('/')

        for days_before in days_list:
            target_renewal_date = today + timedelta(days=days_before)
            subs_to_remind = Subscription.objects.filter(
                is_active=True,
                renewal_date=target_renewal_date,
                reminders_enabled=True,
            ).annotate(
                usage_this_month=Count(
                    'usage_logs',
                    filter=Q(usage_logs__used_on__range=[month_start, today]),
                )
            ).select_related('user', 'user__reminder_preference')

            for sub in subs_to_remind:
                pref = getattr(sub.user, 'reminder_preference', None)
                if pref is not None and not pref.reminders_enabled:
                    continue
                user_days = pref.get_reminder_days_list() if pref else [7, 3, 1]
                if days_before not in user_days:
                    continue
                reminder, created = SubscriptionReminder.objects.get_or_create(
                    subscription=sub,
                    days_before=days_before,
                )
                if reminder.is_sent:
                    continue

                monthly_cost = (
                    sub.cost if sub.billing_frequency == 'monthly'
                    else sub.cost / 12
                )

                if sub.usage_this_month == 0:
                    usage_message = "You haven't used this subscription this month. You may want to cancel it before renewal."
                else:
                    usage_message = "Looks like you're getting value from this subscription 👍"

                unsubscribe_token = signer.sign(sub.user.pk)
                unsubscribe_url = f"{site_url}/api/unsubscribe/?token={unsubscribe_token}"
                context = {
                    "user_name": sub.user.username,
                    "subscription_name": sub.name,
                    "days_before": days_before,
                    "monthly_cost": round(float(monthly_cost), 2),
                    "usage_count": sub.usage_this_month,
                    "usage_message": usage_message,
                    "manage_url": "https://didiactuallyusethis.com/subscriptions",
                    "unsubscribe_url": unsubscribe_url,
                }

                if not sub.user.email:
                    self.stdout.write(self.style.WARNING(f"Skipping '{sub.name}': No email for user '{sub.user.username}'"))
                    continue

                try:
                    subject = f"Reminder: Your subscription '{sub.name}' renews in {days_before} day(s)"
                    text_body = render_to_string("reminders/renewal_email.txt", context)
                    html_body = render_to_string("reminders/renewal_email.html", context)

                    resend.Emails.send({
                        "from": "Did I Actually Use This <onboarding@resend.dev>",
                        "to": [sub.user.email],
                        "subject": subject,
                        "html": html_body,
                        "text": text_body,
                    })

                    self.stdout.write(self.style.SUCCESS(f"Email sent to {sub.user.email} for {sub.name} ({days_before} day(s) before)"))
                    reminder.mark_as_sent()

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to send email to {sub.user.email}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS("Renewal reminders processing completed."))