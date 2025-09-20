from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Task
from .serializers import TaskSerializer


@receiver(post_save, sender=Task)
def broadcast_task_update(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    task_data = TaskSerializer(instance).data

    async_to_sync(channel_layer.group_send)(
        'tasks_updates',
        {
            'type': 'task_update',
            'task_data': task_data
        }
    )
