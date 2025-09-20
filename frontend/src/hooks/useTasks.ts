import { useState } from "react";
import axios from "../api/axios";
import type { Task } from "../types/Authtypes";

const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);


  const createTask = async (task: Omit<Task, "id">) => {
    try {
      const response = await axios.post("tasks", task);
      setTasks([...tasks, response.data]);
    } catch (error: any) {
      setError(error.message);
    }
  };

const updateTask = async ({ id, task }: { id: number; task: Task }) => {
  try {
    const response = await axios.put(`tasks/${id}/`, task);
    setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
    return response.data;
  } catch (error: any) {
    setError(error.message);
    throw error;
  }
};

  const deleteTask = async (id: number) => {
    try {
      await axios.delete(`tasks/${id}/`);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error: any) {
      setError(error.message);
    }
  };

  return {
    tasks,
    error,
    createTask: createTask,
    updateTask: updateTask,
    deleteTask: deleteTask,
    statusOptions: statusOptions,
    priorityOptions: priorityOptions,
  };
};

const statusOptions = [
  "Not Started",
  "In Progress",
  "Pending",
  "On Hold",
  "Completed",
] as const;
const priorityOptions = ["Low", "Medium", "High"] as const;

const useCreateTask = () => {
  const { createTask } = useTasks();
  return createTask;
};

const useUpdateTask = () => {
  const { updateTask } = useTasks();
  return updateTask;
};

const useDeleteTask = () => {
  const { deleteTask } = useTasks();
  return deleteTask;
};

export { useTasks, useCreateTask, useUpdateTask, useDeleteTask };
