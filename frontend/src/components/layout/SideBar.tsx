import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import TaskIcon from "@mui/icons-material/Task";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import Box from "@mui/material/Box";
import { createTheme } from "@mui/material/styles";
import {
  AppProvider,
  type Navigation,
  type NavigationItem as ToolpadNavigationItem,
} from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

type CustomNavigationItem = ToolpadNavigationItem & {
  requiredPermissions?: string[];
};

const NAVIGATION: CustomNavigationItem[] = [
  {
    segment: "dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    requiredPermissions: [],
  },
  {
    segment: "my_task",
    title: "My Tasks",
    icon: <TaskAltIcon />,
    requiredPermissions: ["tasks.view_task"],
  },
  {
    segment: "config",
    title: "Configuration",
    icon: <SettingsIcon />,
    requiredPermissions: ["auth.view_user"],
  },
];

interface Props {
  children: React.ReactNode;
}

const fixedTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
  },
});

const ToolpadDashboardLayout: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const router = {
    pathname: location.pathname,
    searchParams: new URLSearchParams(location.search),
    navigate: (to: string | URL) => {
      const url = typeof to === "string" ? to : to.toString();
      navigate(url);
    },
  };

  const session = {
    user: {
      name: auth?.user_info?.first_name,
      email: auth?.user_info?.email,
      image:auth?.user_info?.first_name
    },
  };

  const authentication = {
    signIn: () => {},
    signOut: () => {
      logout();
    },
  };

  const userPermissions: string[] = (auth?.user_permissions || []) as string[];

const filteredNavigation = NAVIGATION.filter((item) => {
  return (item.requiredPermissions ?? []).every((perm: string) =>
    userPermissions.includes(perm)
  );
}) as Navigation;


  return (
    <AppProvider
      session={session}
      authentication={authentication}
      navigation={filteredNavigation}
      router={router}
      theme={fixedTheme}
    >
      <DashboardLayout
      defaultSidebarCollapsed
        branding={{
          logo: <TaskIcon color="primary" />,
          title: "Task Management",
          homeUrl: "/dashboard",
        }}
      >
        <Box sx={{ py: 2, px: 3 }}>{children}</Box>
      </DashboardLayout>
    </AppProvider>
  );
};

export default ToolpadDashboardLayout;
