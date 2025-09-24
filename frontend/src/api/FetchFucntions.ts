import API from "./axios"; // your configured axios instance

// Task related functions
export const getTasks = async () => {
  const response = await API.get("tasks/");
  return response.data;
};

export const createTask = async (task: any) => {
  const response = await API.post("tasks/", task);
  return response.data;
};

export const updateTask = async (task: any) => {
  const response = await API.put(`tasks/${task.id}/`, task);
  return response.data;
};

export const deleteTask = async (id: string | number) => {
  const response = await API.delete(`tasks/${id}/`);
  return response.data;
};

// User related functions
export const getUsers = async () => {
  const response = await API.get("users/list/");
  return response.data;
};

export const createUser = async (data: any) => {
  const response = await API.post("users/register/", data);
  return response.data;
};

export const updateUser = async ({ id, data }: { id: number; data: any }) => {
  const response = await API.put(`users/update/${id}/`, data);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await API.delete(`users/delete/${id}/`);
  return response.data;
};
=======
export const UserGet =async()=>{
    const res = await API.get("users/list/")
    return res.data
}
