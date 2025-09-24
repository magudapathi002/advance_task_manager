from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (user_info, user_list,
                    UserCreateViewSet, update_user_info, UserDeleteAPIView)

# Router config
router = DefaultRouter()
router.register(r'register', UserCreateViewSet, basename='register')

urlpatterns = [
    path("update/<int:id>/", update_user_info, name="update-user-info"),
    path("delete/<int:id>/", UserDeleteAPIView.as_view(), name="delete-user-info"),
    path('info/', user_info, name='user-info'),
    path('list/', user_list, name='user-list'),
] + router.urls
