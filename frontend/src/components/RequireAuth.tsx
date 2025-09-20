import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

type RequireAuthProps = {
  requiredPermissions?: string[];
};

const RequireAuth = ({ requiredPermissions = [] }: RequireAuthProps) => {
  const { auth, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!auth?.tokens?.access) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userPermissions: string[] = auth?.user_permissions || [];
  const hasPermissions = requiredPermissions.every((perm) =>
    userPermissions.includes(perm)
  );

  if (!hasPermissions) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
