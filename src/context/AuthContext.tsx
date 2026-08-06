import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { AuthContext } from "./authContextValue";
import type { Role, User } from "../types/user";

const demoUsers: Record<Role, User> = {
  reporter: { id: "USR-001", name: "คุณศิริพร วัฒนากร", role: "reporter" },
  technician: { id: "USR-002", name: "นายธนกร ช่างทอง", role: "technician" },
  admin: { id: "USR-003", name: "นางสาวกมลวรรณ ศรีสุข", role: "admin" },
};

function getInitialRole(): Role {
  const savedRole = window.localStorage.getItem("isri-demo-role");
  return savedRole === "technician" ||
    savedRole === "admin" ||
    savedRole === "reporter"
    ? savedRole
    : "reporter";
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [role, setRole] = useState<Role>(getInitialRole);
  useEffect(() => {
    window.localStorage.setItem("isri-demo-role", role);
  }, [role]);
  const value = useMemo(() => ({ user: demoUsers[role], setRole }), [role]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
