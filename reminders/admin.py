from django.contrib import admin
from .models import SubscriptionReminder

# Register your models here.
@admin.register(SubscriptionReminder)
class SubscriptionReminderAdmin(admin.ModelAdmin):
    list_display = ('subscription' , 'days_before'  , 'is_sent', 'sent_at' , 'created_at')
    list_filter = ('days_before' , 'sent_at' , 'created_at')
    search_fields = ('subscription__name' , 'subscription__user__username') 
    readonly_fields = ('created_at' , 'sent_at')
    ordering = ('-created_at' , )


