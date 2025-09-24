from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (TaskViewSet, DashboardAPIView)

# Router config
router = DefaultRouter()
router.register(r'', TaskViewSet, basename="tasks")

urlpatterns = [
  path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
] + router.urls