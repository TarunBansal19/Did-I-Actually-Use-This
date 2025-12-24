from django.db.models import Count, Q
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from subscriptions.models import Subscription


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = now().date()
        first_day_of_month = today.replace(day=1)

        # Fetch subscriptions with monthly usage count
        subscriptions = Subscription.objects.filter(
            user=request.user,
            is_active=True
        ).annotate(
            monthly_usage_count=Count(
                'usage_logs',
                filter=Q(
                    usage_logs__used_on__range=[first_day_of_month, today]
                )
            )
        )

        total_monthly_spend = 0
        subscriptions_data = []
        category_map = {}

        for sub in subscriptions:
            # Normalize cost to monthly
            cost_this_month = (
                sub.cost / 12 if sub.billing_frequency == 'yearly'
                else sub.cost
            )

            total_monthly_spend += cost_this_month

            uses = sub.monthly_usage_count
            cost_per_use = (
                round(float(cost_this_month) / uses, 2)
                if uses > 0 else None
            )

            # Subscription-level data
            subscriptions_data.append({
                "id": sub.id,
                "name": sub.name,
                "category": sub.category,
                "monthly_cost": round(float(cost_this_month), 2),
                "uses_this_month": uses,
                "cost_per_use": cost_per_use,
                "is_wasted": uses == 0
            })

            # Category aggregation (monthly-normalized)
            if sub.category not in category_map:
                category_map[sub.category] = 0

            category_map[sub.category] += cost_this_month

        # Category breakdown
        categories_data = []
        for category, cost in category_map.items():
            percentage = (
                round((cost / total_monthly_spend) * 100, 2)
                if total_monthly_spend > 0 else 0
            )

            categories_data.append({
                "category": category,
                "monthly_cost": round(float(cost), 2),
                "percentage": percentage
            })

        return Response({
            "total_monthly_spend": round(float(total_monthly_spend), 2),
            "subscriptions": subscriptions_data,
            "categories": categories_data
        })
