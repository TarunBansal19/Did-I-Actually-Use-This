from django.conf import settings
from django.core.signing import Signer, BadSignature
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserReminderPreference
from .serializers import ReminderPreferenceSerializer

signer = Signer()


class ReminderPreferenceView(APIView):
    """GET/PATCH current user's reminder preferences."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pref, _ = UserReminderPreference.objects.get_or_create(
            user=request.user,
            defaults={'reminder_days': '7,3,1', 'reminders_enabled': True},
        )
        serializer = ReminderPreferenceSerializer(pref)
        data = serializer.data
        data['reminder_days_list'] = pref.get_reminder_days_list()
        return Response(data)

    def patch(self, request):
        pref, _ = UserReminderPreference.objects.get_or_create(
            user=request.user,
            defaults={'reminder_days': '7,3,1', 'reminders_enabled': True},
        )
        serializer = ReminderPreferenceSerializer(pref, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            data = ReminderPreferenceSerializer(pref).data
            data['reminder_days_list'] = pref.get_reminder_days_list()
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def unsubscribe_view(request):
    """One-click unsubscribe: ?token=... sets user's reminders_enabled=False. No auth required."""
    token = request.GET.get('token', '').strip()
    if not token:
        return HttpResponse(
            '<html><body style="font-family:sans-serif;padding:2rem;text-align:center;">'
            '<h1>Invalid link</h1><p>Missing token.</p></body></html>',
            status=400,
        )
    try:
        user_id = signer.unsign(token)
    except BadSignature:
        return HttpResponse(
            '<html><body style="font-family:sans-serif;padding:2rem;text-align:center;">'
            '<h1>Invalid link</h1><p>This unsubscribe link is invalid or expired.</p></body></html>',
            status=400,
        )
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return HttpResponse(
            '<html><body style="font-family:sans-serif;padding:2rem;text-align:center;">'
            '<h1>Not found</h1><p>User not found.</p></body></html>',
            status=404,
        )
    pref, _ = UserReminderPreference.objects.get_or_create(
        user=user,
        defaults={'reminder_days': '7,3,1', 'reminders_enabled': True},
    )
    pref.reminders_enabled = False
    pref.save()
    return HttpResponse(
        '<html><body style="font-family:Georgia,serif;padding:3rem;text-align:center;max-width:480px;margin:0 auto;">'
        '<h1 style="color:#1a1614;">You’re unsubscribed</h1>'
        '<p style="color:#6b6560;">Renewal reminder emails are now turned off. You can turn them back on in your account settings.</p>'
        '<p style="color:#6b6560;font-size:0.9rem;">— Did I Actually Use This?</p>'
        '</body></html>',
        content_type='text/html',
    )
