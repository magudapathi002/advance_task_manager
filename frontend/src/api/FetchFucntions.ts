import API from "./axios"; // your configured axios instance

export const GetTasks = async () => {
  const response = await API.get("tasks/");
  return response.data;
};

export const CreateTask = async (task: any) => {
  const response = await API.post("tasks/", task);
  return response.data;
};

export const UpdateTask = async (task: any) => {
  const response = await API.put(`tasks/${task.id}/`, task);
  return response.data;
};

export const DeleteTask = async (id: string | number) => {
  const response = await API.delete(`tasks/${id}/`);
  return response.data;
};

export const UserGet =async()=>{
    const res = await API.get("users/list/")
    return res.data
}