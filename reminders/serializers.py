from rest_framework import serializers
from .models import UserReminderPreference


class ReminderPreferenceSerializer(serializers.ModelSerializer):
    reminder_days_list = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=30),
        required=False,
        write_only=True,
    )

    class Meta:
        model = UserReminderPreference
        fields = ['reminders_enabled', 'reminder_days', 'reminder_days_list']
        extra_kwargs = {
            'reminder_days': {'read_only': True},
        }

    def validate_reminder_days_list(self, value):
        if value is not None and not all(1 <= d <= 30 for d in value):
            raise serializers.ValidationError('Each day must be between 1 and 30.')
        return value

    def update(self, instance, validated_data):
        days_list = validated_data.pop('reminder_days_list', None)
        if days_list is not None:
            instance.reminder_days = ','.join(str(d) for d in sorted(set(days_list)))
        for key, val in validated_data.items():
            setattr(instance, key, val)
        instance.save()
        return instance
