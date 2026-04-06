from django.urls import path
from .views import ReminderPreferenceView, unsubscribe_view

urlpatterns = [
    path('reminders/preferences/', ReminderPreferenceView.as_view(), name='reminder-preferences'),
    path('unsubscribe/', unsubscribe_view, name='unsubscribe'),
]
