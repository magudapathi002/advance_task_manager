import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getTasks } from "../api/FetchFucntions";
import { Button } from "@radix-ui/themes";
import useAuth from "../hooks/useAuth";
import { useDeleteTask } from "../hooks/useTasks";
import TaskPopup from "../popup/TaskPopup";
import type { Task } from "../types/Authtypes";
import { DataGrid, GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Tasks = () => {
  const { auth, loading } = useAuth();
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });
  const deleteTaskMutation = useDeleteTask();

  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setOpen(true);
  };

  const handleDeleteTask = (id: number) => {
    deleteTaskMutation.mutate(id);
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

      if (auth?.user_info?.is_superadmin) {
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
  }
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Button
        onClick={() => {
          setSelectedTask(null);
          setOpen(true);
        }}
      >
        Add Task
      </Button>
      <TaskPopup open={open} onOpenChange={setOpen} task={selectedTask} />
      <DataGrid rows={tasks} columns={columns}/>
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
