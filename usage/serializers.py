from rest_framework import serializers
from .models import UsageLog

class UsageLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsageLog
        fields = ['id' , 'used_on']
        read_only_fields = ['id']
        