from django.urls import path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework.routers import DefaultRouter

from .views import (TaskViewSet, user_info, user_list, DashboardAPIView,
                    UserCreateViewSet, update_user_info, UserDeleteAPIView)

# Swagger config
schema_view = get_schema_view(
    openapi.Info(
        title="Task Manager API",
        default_version='v1',
        description="Task management API with real-time updates, role-based access, and token auth.",
        contact=openapi.Contact(email="you@example.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

# Router config
router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'user_register', UserCreateViewSet, basename='register')

urlpatterns = [
  path("update-user/<int:id>/", update_user_info, name="update-user-info"),
    path("delete-user/<int:id>/", UserDeleteAPIView.as_view(), name="delete-user-info"),
  path('user-info/', user_info, name='user-info'),
  path('user_list/', user_list, name='user-list'),
  path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
] + router.urls