# tasks/filters.py

import django_filters
from rest_framework.authtoken.admin import User

from .models import Task


class TaskFilter(django_filters.FilterSet):
    due_date = django_filters.DateFilter(field_name='due_date', lookup_expr='lte')
    priority = django_filters.ChoiceFilter(choices=Task.PRIORITY_CHOICES)
    assigned_to = django_filters.ModelChoiceFilter(queryset=User.objects.all())

    class Meta:
        model = Task
        fields = ['due_date', 'priority', 'assigned_to', 'status']
