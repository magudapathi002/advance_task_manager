# tasks/consumers.py

import json

from channels.generic.websocket import AsyncWebsocketConsumer

from .models import Task
from .serializers import TaskSerializer


class TaskConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'tasks_updates'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        task_id = text_data_json['task_id']
        task = Task.objects.get(id=task_id)
        task.status = 'completed'  # Example: change status
        task.save()

        # Send updated task data to WebSocket
        task_data = TaskSerializer(task).data
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'task_update',
                'task_data': task_data
            }
        )

    async def task_update(self, event):
        task_data = event['task_data']
        await self.send(text_data=json.dumps({
            'task_data': task_data
        }))
