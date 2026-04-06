from datetime import date
from rest_framework import serializers
from .models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    used_today = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = [
            'id',
            'name',
            'category',
            'cost',
            'billing_frequency',
            'renewal_date',
            'cancel_url',
            'is_active',
            'reminders_enabled',
            'created_at',
            'used_today',
        ]
        read_only_fields = ['id', 'created_at']

    def get_used_today(self, obj):
        today = date.today()
        return obj.usage_logs.filter(used_on=today).exists()

    def create(self, validated_data):
        request = self.context['request']
        return Subscription.objects.create(
            user=request.user,
            **validated_data
        )
