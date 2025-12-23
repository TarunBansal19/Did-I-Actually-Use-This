from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Subscription
from .serializers import SubscriptionSerializer
from .permissions import isOwner
from datetime import datetime
from django.db import IntegrityError
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from usage.serializers import UsageLogSerializer

# Create your views here.
class SubscriptionViewSet(ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated , isOwner] # The user must be authenticated and must be the owner

    # Override get_queryset to return only subscriptions of the auth user
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    # Override perform_destroy to implement soft delete
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

    @action(detail=True , methods = ['post'] , url_path='use-today')
    def use_today(self , request , pk = None):
        subscription = self.get_object()
        today = date.today()

        #Check if a usage log for today already exists
        if subscription.usage_logs.filter(used_on = today).exists():
            return Response({"detail" : "Usage for today already logged."} , status= status.HTTP_400_BAD_REQUEST)
        
        #Create a new usage log for today
        try:
            usage_log = subscription.usage_logs.create(used_on = today)
            serializer = UsageLogSerializer(usage_log)
            return Response(serializer.data , status=status.HTTP_201_CREATED)
        except IntegrityError: #If a log for today was created in the meantime 
            return Response({"detail" : "Usage for today already logged."} , status= status.HTTP_400_BAD_REQUEST)
        
    