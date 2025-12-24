from django.urls import path 
from .views import DashboardSummaryView

urlpatterns = [
    path('dashboard/summary/' , DashboardSummaryView.as_view() , name = 'dashboard-summary')
]
