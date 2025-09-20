// src/components/UserTable.tsx
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { Button } from "@radix-ui/themes";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDeleteUser, useUsers } from "../hooks/useUsers";
import UserPopup from "../popup/UserPopup";
import type { User } from "../types/Authtypes";

export default function UserTable() {
  const { data: users = [], isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setPopupOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(undefined);
    setPopupOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteUser.mutate(id, {
      onSuccess: () => toast.success("User deleted"),
    });
  };


  const columns: GridColDef[] = [
    { field: "username", headerName: "Username", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "first_name", headerName: "First Name", flex: 1 },
    { field: "last_name", headerName: "Last Name", flex: 1 },
    {
      field: "is_staff",
      headerName: "Staff Status",
      flex: 1,
      renderCell: (params) => (params.value ? "Yes" : "No"),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row as User)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.id as number)}
        />,
      ],
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <Button onClick={handleAdd}>+ Add User</Button>
      </div>

      <DataGrid
        rows={users}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.id}
        autoHeight
        pageSizeOptions={[5, 10]}
      />

      <UserPopup
        user={selectedUser}
        open={popupOpen}
        onOpenChange={setPopupOpen}
      />
    </div>
  );
}
