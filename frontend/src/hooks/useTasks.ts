import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, createTask, updateTask, deleteTask } from "../api/FetchFucntions";
import toast from "react-hot-toast";

export const useTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.title || "Failed to create task.");
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.title || "Failed to update task.");
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to delete task.");
    },
  });
};

export const statusOptions = [
  "Not Started",
  "In Progress",
  "Pending",
  "On Hold",
  "Completed",
] as const;

export const priorityOptions = ["Low", "Medium", "High"] as const;
