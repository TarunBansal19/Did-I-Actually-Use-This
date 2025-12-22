from rest_framework import serializers
from .models import UsageLog

class UsageLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsageLog
        fields = '__all__'
        read_only_fields = ['id']
        