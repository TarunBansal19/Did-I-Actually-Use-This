from rest_framework import serializers
from .models import Subscription

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__' 
        read_only_fields = ['id','created_at']

        def create(self , validated_data):
            request = self.context('request')
            return Subscription.objects.create(
                user = request.user
                **validated_data
            )
