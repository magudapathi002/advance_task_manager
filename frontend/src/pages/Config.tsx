import { Toaster } from "react-hot-toast";
import UserTable from "../components/UserTable";
// import UserPopup from "../popup/UserPopup";

export default function Config() {
  return (
    <>
    {/* <UserPopup/> */}
      <UserTable />
      <Toaster position="top-center" />
    </>
  );
}
