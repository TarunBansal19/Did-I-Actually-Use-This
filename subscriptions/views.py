from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Subscription
from .serializers import SubscriptionSerializer
from .permissions import isOwner

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
