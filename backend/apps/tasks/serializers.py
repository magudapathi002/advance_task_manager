from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    priority_label = serializers.CharField(source='get_priority_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True, allow_null=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['created_by', 'created_on']

    def validate_title(self, value):
        request = self.context.get('request')
        if request and request.method == 'POST':
            user = request.user
            if Task.objects.filter(title__iexact=value, created_by=user).exists():
                raise serializers.ValidationError("You already have a task with this title.")
        return value
