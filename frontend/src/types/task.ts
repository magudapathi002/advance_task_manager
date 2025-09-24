export interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
  created_by: number;
  assigned_to: number;
  created_on: string;
  priority_label: string;
  status_label: string;
  assigned_to_username?: string;
  created_by_username?: string;
}
