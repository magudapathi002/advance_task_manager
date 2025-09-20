import { Route, Routes } from "react-router-dom";
import "./App.css";
import Config from "./pages/Config";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Login from "./components/Login";
import RequireAuth from "./components/RequireAuth";
import ToolpadDashboardLayout from "./components/SideBar";
import Tasks from "./pages/Tasks";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Layout />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* we want to protect these routes */}
        <Route element={<RequireAuth />}>
          <Route
            path="/dashboard"
            element={
              <ToolpadDashboardLayout>
                <Dashboard />
              </ToolpadDashboardLayout>
            }
          />
        </Route>

        <Route element={<RequireAuth requiredPermissions={["tasks.view_task"]} />}>
          <Route
            path="/my_task"
            element={
              <ToolpadDashboardLayout>
                <Tasks />
              </ToolpadDashboardLayout>
            }
          />
        </Route>

        <Route element={<RequireAuth requiredPermissions={["auth.view_user"]} />}>
          <Route
            path="/config"
            element={
              <ToolpadDashboardLayout>
                <Config />
              </ToolpadDashboardLayout>
            }
          />
        </Route>

        {/* Unauthorized route */}
        <Route path="/unauthorized" element={<div>Unauthorized</div>} />

      </Routes>
  );
}

export default App;
