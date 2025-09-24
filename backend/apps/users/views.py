from rest_framework.exceptions import NotFound
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import mixins
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.tasks.models import Task
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
