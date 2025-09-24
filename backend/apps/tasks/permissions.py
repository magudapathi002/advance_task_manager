from rest_framework.permissions import BasePermission

def is_admin(user):
    """Checks if a user is an admin."""
    return user.groups.filter(name='Admin').exists()


class IsAdminUser(BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and is_admin(request.user)


class IsAdminOrTaskOwner(BasePermission):
    """
    Allows admin users to perform any action.
    Allows task creators or assignees to modify the task.
    """
    def has_object_permission(self, request, view, obj):
        if is_admin(request.user):
            return True
        return obj.created_by == request.user or obj.assigned_to == request.user
