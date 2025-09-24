from django.contrib.auth.models import User
from django.db.models import Q
from ..tasks.models import Task


class UserService:
    @staticmethod
    def can_delete_user(user_to_delete: User):
        """
        Checks if a user can be deleted. A user cannot be deleted if they have
        created or been assigned any tasks.
        """
        tasks_count = Task.objects.filter(
            Q(created_by=user_to_delete) | Q(assigned_to=user_to_delete)
        ).count()
        return tasks_count == 0

    @staticmethod
    def delete_user(user_to_delete: User):
        """
        Deletes a user if they are allowed to be deleted.
        """
        if not UserService.can_delete_user(user_to_delete):
            raise ValueError("This user cannot be deleted because they have tasks assigned or created.")

        user_to_delete.delete()

    @staticmethod
    def update_user(user_to_update: User, **kwargs):
        """
        Updates a user's information.
        """
        for key, value in kwargs.items():
            setattr(user_to_update, key, value)
        user_to_update.save()
        return user_to_update
