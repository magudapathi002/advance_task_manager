from datetime import datetime
from enum import Enum

from django.contrib.auth.models import User
from django.db import models


class TaskStatus(Enum):
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    PENDING = "Pending"
    ON_HOLD = "On Hold"
    COMPLETED = "Completed"

    @classmethod
    def choices(cls):
        return [(status.value, status.name.replace("_", " ").title()) for status in cls]


class PriorityEnum(Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

    @classmethod
    def choices(cls):
        return [(priority.value, priority.name.replace("_", " ").title()) for priority in cls]


class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    priority = models.CharField(
        max_length=20,
        choices=PriorityEnum.choices(),  # Use Enum choices for priority
        default=PriorityEnum.LOW.value  # Set default to LOW
    )
    status = models.CharField(
        max_length=20,
        choices=TaskStatus.choices(),  # Use Enum choices for task status
        default=TaskStatus.NOT_STARTED.value
    )
    created_by = models.ForeignKey(User, related_name='created_tasks', on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(User, related_name='assigned_tasks', on_delete=models.SET_NULL, null=True,
                                    blank=True)
    created_on = models.DateTimeField(default=datetime.now, editable=False)

    def __str__(self):
        return self.title
