from django.shortcuts import render
from django.utils import timezone
from django.db.models import Q, Count
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Subscription
from .serializers import SubscriptionSerializer
from .permissions import isOwner
from datetime import date
from django.db import IntegrityError
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from usage.serializers import UsageLogSerializer


class SubscriptionViewSet(ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated, isOwner]

    def get_queryset(self):
        qs = self.queryset.filter(user=self.request.user)
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(name__icontains=search)
        category = self.request.query_params.get('category', '').strip()
        if category:
            qs = qs.filter(category=category)
        unused = self.request.query_params.get('unused', '').lower()
        if unused in ('1', 'true', 'yes'):
            today = timezone.now().date()
            month_start = today.replace(day=1)
            qs = qs.filter(is_active=True).annotate(
                usage_this_month=Count(
                    'usage_logs',
                    filter=Q(usage_logs__used_on__range=[month_start, today]),
                )
            ).filter(usage_this_month=0)
        return qs
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
        
    