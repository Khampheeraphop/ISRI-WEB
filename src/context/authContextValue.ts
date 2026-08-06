import { createContext } from "react";
import type { Role, User } from "../types/user";

export interface AuthValue {
  user: User;
  setRole: (role: Role) => void;
}

export const AuthContext = createContext<AuthValue | undefined>(undefined);
