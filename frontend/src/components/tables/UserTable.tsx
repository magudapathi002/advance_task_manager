// src/components/UserTable.tsx
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDeleteUser, useUsers } from "../../hooks/useUsers";
import UserPopup from "../popups/UserPopup";
import type { User } from "../../types/user";
import Box from "@mui/material/Box";

export default function UserTable() {
  const { data: users = [], isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setPopupOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(undefined);
    setPopupOpen(true);
  };

  const handleDelete = (id: number) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
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
    <Box sx={{ height: 520, width: '100%' }}>
      <DataGrid
        rows={users}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.id}
        pageSizeOptions={[5, 10]}
      />
    </Box>
      <UserPopup
        user={selectedUser}
        open={popupOpen}
        onOpenChange={setPopupOpen}
      />
      <AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialog.Content>
          <AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete this user? This action cannot be undone.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" color="red" onClick={() => {
                if (userToDelete) {
                  deleteUser.mutate(userToDelete, {
                    onSuccess: () => toast.success("User deleted"),
                  });
                }
                setDeleteDialogOpen(false);
              }}>
                Delete
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
}
