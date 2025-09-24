import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  AlertDialog,
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from "@mui/x-data-grid";
import { Button, Flex, Text } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getTasks } from "../api/FetchFucntions";
import useAuth from "../hooks/useAuth";
import { useDeleteTask } from "../hooks/useTasks";
import TaskPopup from "../popup/TaskPopup";
import type { Task } from "../types/Authtypes";

const Tasks = () => {
  const { auth, loading } = useAuth();
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });
  const deleteTaskMutation = useDeleteTask();

  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setOpen(true);
  };

  const handleDeleteTask = (id: number) => {
    setTaskToDelete(id);
    setDeleteDialogOpen(true);
  };

  const columns: GridColDef[] = [
    { field: "title", headerName: "Title", minWidth: 150, editable: true },
    {
      field: "description",
      headerName: "Description",
      minWidth: 200,
    },
    {
      field: "due_date",
      headerName: "Due Date",
      type: "date",
      minWidth: 100,
      editable: true,
      valueGetter: (params) => {
        const value = params;
        return value ? new Date(value) : null;
      },
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      editable: true,
      type: "singleSelect",
    },
    {
      field: "priority",
      headerName: "Priority",
      minWidth: 150,
      type: "singleSelect",
    },
    {
      field: "assigned_to_username",
      headerName: "Assigned To",
      minWidth: 200,
    },
    {
      field: "created_by_username",
      headerName: "Created By",
      minWidth: 200,
      editable: false,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEditTask(params.row)}
            showInMenu={false}
          />,
        ];

        if (auth?.user_info?.is_superuser) {
          actions.push(
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => handleDeleteTask(params.row.id)}
              showInMenu={false}
            />
          );
        }
        return actions;
      },
    },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-1.5">
      <div>
        <Button
          onClick={() => {
            setSelectedTask(null);
            setOpen(true);
          }}
        >
          Add Task
        </Button>
      </div>
      <div>
        <TaskPopup open={open} onOpenChange={setOpen} task={selectedTask} />
        <AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialog.Content>
            <AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
            <AlertDialog.Description>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialog.Description>
            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button variant="solid" color="red" onClick={() => {
                  if (taskToDelete) {
                    deleteTaskMutation.mutate(taskToDelete);
                  }
                  setDeleteDialogOpen(false);
                }}>
                  Delete
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
        <DataGrid rows={tasks} columns={columns} />
      </div>
      {/* {isLoading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              {task.title}
              <Button onClick={() => handleEditTask(task)}>Edit</Button>
            </li>
          ))}
        </ul>
      )} */}
    </div>
  );
};

export default Tasks;
