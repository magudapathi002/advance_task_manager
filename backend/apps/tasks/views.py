from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .permissions import IsAdminOrTaskOwner
from .serializers import TaskSerializer
from .services import TaskService


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsAdminOrTaskOwner]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['priority', 'due_date', 'assigned_to', 'status']

    def get_queryset(self):
        return TaskService.get_tasks_for_user(self.request.user)

    def perform_create(self, serializer):
        try:
            TaskService.create_task(user=self.request.user, **serializer.validated_data)
        except ValueError as e:
            raise ValidationError({"detail": str(e)})

    def perform_update(self, serializer):
        try:
            TaskService.update_task(task=serializer.instance, user=self.request.user, **serializer.validated_data)
        except ValueError as e:
            raise ValidationError({"detail": str(e)})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        TaskService.delete_task(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        queryset = TaskService.get_tasks_for_user(request.user)
        data = TaskService.get_dashboard_data(request.user, queryset)
        return Response(data)
