import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  Select,
} from "@radix-ui/themes";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useCreateTask, useUpdateTask, statusOptions, priorityOptions } from "../hooks/useTasks";
import type { Task } from "../types/Authtypes";
import useAuth from "../hooks/useAuth";

// ✅ Schema
const taskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  status: z.enum([
    statusOptions[0],
    statusOptions[1],
    statusOptions[2],
    statusOptions[3],
    statusOptions[4],
  ]),
  due_date: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  created_by: z.number().optional(),
  assigned_to: z.number().optional(),
});

type TaskFormDataZod = z.infer<typeof taskSchema>;

interface TaskPopupProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskPopup = ({ task, open, onOpenChange }: TaskPopupProps) => {
  const { auth } = useAuth();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskFormDataZod>({
    resolver: zodResolver(taskSchema),
  });

  // Wait until auth is loaded
  useEffect(() => {
    if (!auth?.user_info) return;

    if (task) {
      reset({
        title: task.title,
        description: task.description ?? "",
        status: task.status as (typeof statusOptions)[number],
        due_date: task.due_date,
        priority: task.priority as (typeof priorityOptions)[number],
        created_by: task.created_by,
        assigned_to: task.assigned_to,
      });
    } else {
      // Create mode defaults
      reset({
        title: "",
        description: "",
        status: statusOptions[0],
        due_date: "",
        priority: priorityOptions[0],
        created_by: auth.user_info.id,
        assigned_to: 0,
      });
    }
  }, [task, reset, auth]);

  // Determine disabled state for fields
  const isSuperAdmin = auth?.user_info?.is_superadmin;
  const isStaff = auth?.user_info?.is_staff;
  const isCreateMode = !task;

  const onSubmit: SubmitHandler<TaskFormDataZod> = (data) => {
    if (!auth?.user_info) return;

    const safeData = {
      title: data.title,
      status: data.status,
      description: data.description ?? "",
      due_date: data.due_date ?? "",
      priority: data.priority ?? "Low",
      created_by: data.created_by ?? auth.user_info.id,
      assigned_to: data.assigned_to ?? 0,
    };

    if (task) {
      updateTaskMutation.mutate({ ...safeData, id: task.id });
    } else {
      createTaskMutation.mutate(safeData);
    }
    onOpenChange(false);
  };

  // Show loader or null until auth loaded
  if (!auth?.user_info) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Title>{task ? "Edit Task" : "Add Task"}</Dialog.Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="3" mt="3">
            <TextField.Root
              placeholder="Title"
              {...register("title")}
              disabled={!isCreateMode && !(isSuperAdmin ?? false)}
            />
            {errors.title && <Text color="red">{errors.title.message}</Text>}

            <TextField.Root
              placeholder="Description"
              {...register("description")}
              disabled={!isCreateMode && !(isSuperAdmin ?? false)}
            />

            <Controller
              name="status"
              control={control}
              defaultValue={statusOptions[0]}
              render={({ field }) => (
                <Select.Root
                  disabled={!isCreateMode && !(isSuperAdmin ?? false) && !(isStaff ?? false)}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <Select.Trigger placeholder="Status" />
                  <Select.Content>
                    {statusOptions.map((status) => (
                      <Select.Item key={status} value={status}>
                        {status}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            />

            <Controller
              name="priority"
              control={control}
              defaultValue={priorityOptions[0]}
              render={({ field }) => (
                <Select.Root
                  disabled={!isCreateMode && !(isSuperAdmin ?? false)}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <Select.Trigger placeholder="Priority" />
                  <Select.Content>
                    {priorityOptions.map((priority) => (
                      <Select.Item key={priority} value={priority}>
                        {priority}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            />

            <TextField.Root
              placeholder="Due Date"
              {...register("due_date")}
              disabled={!isCreateMode && !(isSuperAdmin ?? false)}
            />

            <TextField.Root
              placeholder="Created By"
              {...register("created_by")}
              disabled
            />

            <TextField.Root
              placeholder="Assigned To"
              type="number"
              {...register("assigned_to")}
              disabled={!isCreateMode && !(isSuperAdmin ?? false)}
            />
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" type="button">
                Cancel
              </Button>
            </Dialog.Close>

            <Button type="submit">Save</Button>
          </Flex>
        </form>
      </Dialog.Content>.
    </Dialog.Root>
  );
};

export default TaskPopup;
