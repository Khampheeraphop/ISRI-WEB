import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { Role, User } from "../types/user";

const demoUsers: Record<Role, User> = {
  reporter: { id: "USR-001", name: "คุณศิริพร วัฒนากร", role: "reporter" },
  technician: { id: "USR-002", name: "นายธนกร ช่างทอง", role: "technician" },
  admin: { id: "USR-003", name: "นางสาวกมลวรรณ ศรีสุข", role: "admin" },
};

interface AuthValue {
  user: User;
  setRole: (role: Role) => void;
}
const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [role, setRole] = useState<Role>("reporter");
  const value = useMemo(() => ({ user: demoUsers[role], setRole }), [role]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
