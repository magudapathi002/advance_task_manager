from datetime import datetime
from django.db.models import Count, Q
from django.contrib.auth.models import User
from .models import Task, TaskStatus, PriorityEnum
from .permissions import is_admin


class TaskService:
    @staticmethod
    def get_tasks_for_user(user: User):
        if is_admin(user):
            return Task.objects.all()
        return Task.objects.filter(Q(created_by=user) | Q(assigned_to=user)).order_by('created_on')

    @staticmethod
    def create_task(user: User, title: str, **kwargs):
        if Task.objects.filter(title=title, created_by=user).exists():
            raise ValueError("You already created a task with this title.")
        return Task.objects.create(created_by=user, title=title, **kwargs)

    @staticmethod
    def update_task(task: Task, user: User, title: str, **kwargs):
        if title and Task.objects.filter(title=title, created_by=user).exclude(pk=task.pk).exists():
            raise ValueError("You already have another task with this title.")

        task.title = title if title else task.title
        for key, value in kwargs.items():
            setattr(task, key, value)
        task.save()
        return task

    @staticmethod
    def delete_task(task: Task):
        task.delete()

    def get_dashboard_data(user: User, tasks_filter):
        total_tasks = tasks_filter.count()

        tasks_by_status = tasks_filter.values('status').annotate(count=Count('id')).order_by('status')
        status_dict = {status['status']: status['count'] for status in tasks_by_status}
        all_statuses = {status.value: 0 for status in TaskStatus}
        all_statuses.update(status_dict)

        tasks_filter_without_completed = tasks_filter.exclude(status=TaskStatus.COMPLETED.value)
        tasks_by_priority = tasks_filter_without_completed.values('priority').annotate(count=Count('id')).order_by('priority')
        priority_dict = {priority['priority']: priority['count'] for priority in tasks_by_priority}
        all_priorities = {priority.value: 0 for priority in PriorityEnum}
        all_priorities.update(priority_dict)

        tasks_due_today = tasks_filter.filter(due_date=datetime.today()).count()
        tasks_assigned_to_user = tasks_filter.filter(assigned_to=user).count()

        return {
            'total_tasks': total_tasks,
            'tasks_by_status': {status.replace("_", " ").title(): count for status, count in all_statuses.items()},
            'tasks_by_priority': {priority.replace("_", " ").title(): count for priority, count in all_priorities.items()},
            'tasks_due_today': tasks_due_today,
            'tasks_assigned_to_user': tasks_assigned_to_user,
        }
