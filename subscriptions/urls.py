from .views import SubscriptionViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'subscriptions' ,  SubscriptionViewSet , basename='subscriptions')

urlpatterns = router.urls



