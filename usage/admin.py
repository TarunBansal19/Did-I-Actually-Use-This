from django.contrib import admin
from .models import UsageLog

@admin.register(UsageLog)
# Register your models here.

class UsageLogAdmin(admin.ModelAdmin):
    list_display = ('subscription', 'used_on')
    list_filter = ('used_on',)