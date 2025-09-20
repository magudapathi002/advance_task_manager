from rest_framework.permissions import BasePermission


class IsAdminOrTaskOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow Admin to perform any action
        if request.user.groups.filter(name='Admin').exists():
            return True
        # Only allow the task creator or assignee to modify the task
        return obj.created_by == request.user or obj.assigned_to == request.user
