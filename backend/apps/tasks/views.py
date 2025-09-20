from datetime import datetime
from rest_framework.exceptions import NotFound
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Task
from .models import TaskStatus, PriorityEnum
from .permissions import IsAdminOrTaskOwner
from .serializers import TaskSerializer
from .serializers import UserCreateSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "groups": list(user.groups.values_list('name', flat=True)),
        "permissions": list(user.get_all_permissions())
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    users = User.objects.all()
    user_data = [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "is_superadmin":user.is_superuser
        }
        for user in users
    ]

    return Response(user_data)

class UserDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        user_id = kwargs.get('id')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user has any tasks (either created or assigned)
        tasks_count = Task.objects.filter(Q(created_by=user) | Q(assigned_to=user)).count()

        if tasks_count > 0:
            return Response({
                "detail": "This user cannot be deleted because they have tasks assigned or created."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Delete the user if they have no tasks
        user.delete()

        return Response({"detail": "User deleted successfully."}, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_info(request, id):
    try:
        user = User.objects.get(id=id)  # Assuming 'User' is your user model
    except User.DoesNotExist:
        raise NotFound("User not found.")

    # if user != request.user:  # Optionally, prevent users from updating others' data
    #     return Response({"detail": "You cannot update this user."}, status=403)

    user.email = request.data.get('email', user.email)
    user.first_name = request.data.get('first_name', user.first_name)
    user.last_name = request.data.get('last_name', user.last_name)
    user.save()

    return Response({"message": "User updated successfully."})


class UserCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsAdminOrTaskOwner]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['priority', 'due_date', 'assigned_to', 'status']

    def perform_create(self, serializer):
        user = self.request.user
        title = serializer.validated_data.get('title')

        if Task.objects.filter(title=title, created_by=user).exists():
            raise ValidationError({"title": "You already created a task with this title."})

        serializer.save(created_by=user)

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name='Admin').exists():
            return Task.objects.all()
        return Task.objects.filter(Q(created_by=user) | Q(assigned_to=user)).order_by('created_on')

    def perform_create(self, serializer):
        user = self.request.user
        title = serializer.validated_data.get('title')

        # Check for duplicate title by the same user
        if Task.objects.filter(title=title, created_by=user).exists():
            raise ValidationError({"title": "You already created a task with this title."})

        serializer.save(created_by=user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        title = request.data.get('title')

        if title and Task.objects.filter(title=title, created_by=request.user).exclude(pk=instance.pk).exists():
            return Response({"title": "You already have another task with this title."},
                            status=status.HTTP_400_BAD_REQUEST)

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user

        # Only allow a delete if user is admin or task creator
        if not (user.groups.filter(name='Admin').exists() or instance.created_by == user):
            return Response({"detail": "You do not have permission to delete this task."},
                            status=status.HTTP_403_FORBIDDEN)

        self.perform_destroy(instance)
        return Response(status=status.HTTP_200_OK)


class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Get the current user
        user = self.request.user

        # Check if the user belongs to the 'Admin' group
        if user.groups.filter(name='Admin').exists():
            # Admin can see all tasks
            tasks_filter = Task.objects.all()
        else:
            # Regular user can see tasks that are either assigned to them or created by them
            tasks_filter = Task.objects.filter(Q(created_by=user) | Q(assigned_to=user)).order_by('created_on')

        # Total tasks count
        total_tasks = tasks_filter.count()

        # Tasks by status, including all possible statuses
        tasks_by_status = tasks_filter.values('status').annotate(count=Count('id')).order_by('status')
        status_dict = {status['status']: status['count'] for status in tasks_by_status}

        # Initialize all statuses with 0 count to ensure completeness
        all_statuses = {status.value: 0 for status in TaskStatus}  # Default to 0 count
        all_statuses.update(status_dict)  # Update with actual counts

        # Exclude tasks with 'Completed' status from priority calculation
        tasks_filter_without_completed = tasks_filter.exclude(status=TaskStatus.COMPLETED.value)

        # Tasks by priority, including all possible priorities, excluding 'Completed' tasks
        tasks_by_priority = tasks_filter_without_completed.values('priority').annotate(count=Count('id')).order_by(
            'priority')
        priority_dict = {priority['priority']: priority['count'] for priority in tasks_by_priority}

        # Initialize all priorities with 0 count to ensure completeness
        all_priorities = {priority.value: 0 for priority in PriorityEnum}  # Default to 0 count
        all_priorities.update(priority_dict)  # Update with actual counts

        # Tasks due today
        tasks_due_today = tasks_filter.filter(due_date=datetime.today()).count()

        # Tasks assigned to the current user
        tasks_assigned_to_user = tasks_filter.filter(assigned_to=user).count()

        # Build the response data
        data = {
            'total_tasks': total_tasks,
            'tasks_by_status': {status.replace("_", " ").title(): count for status, count in all_statuses.items()},
            'tasks_by_priority': {priority.replace("_", " ").title(): count for priority, count in
                                  all_priorities.items()},
            'tasks_due_today': tasks_due_today,
            'tasks_assigned_to_user': tasks_assigned_to_user,
        }

        return Response(data)
