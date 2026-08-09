import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { Role } from "../../types/user";

const firstRouteByRole: Record<Role, string> = {
  reporter: "/incidents/mine",
  technician: "/work-orders",
  dispatcher: "/dispatch",
  admin: "/",
};

export function RoleRoute({
  roles,
  children,
}: {
  roles: Role[];
  children: ReactNode;
}) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role))
    return (
      <Navigate to={user ? firstRouteByRole[user.role] : "/login"} replace />
    );
  return <>{children}</>;
}
