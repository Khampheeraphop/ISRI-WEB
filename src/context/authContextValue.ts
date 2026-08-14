import { createContext } from "react";
import type { AuthUser } from "@supabase/supabase-js";
import type { AuthProfile } from "../types/auth";
import type { User } from "../types/user";

export interface AuthValue {
  authUser: AuthUser | null;
  profile: AuthProfile | null;
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: (returnTo?: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<AuthProfile | null>;
}

export const AuthContext = createContext<AuthValue | undefined>(undefined);
