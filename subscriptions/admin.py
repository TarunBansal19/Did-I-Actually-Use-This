from django.contrib import admin
from .models import Subscription

# Register your models here.
@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['name' , 'category' , 'cost' , 'billing_frequency' , 'renewal_date' , 'is_active']
    list_filter = ['category' , 'billing_frequency' , 'is_active']
    search_fields = ['name' , 'category']

