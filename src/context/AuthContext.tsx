import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { AuthUser } from "@supabase/supabase-js";
import { AuthContext } from "./authContextValue";
import { getMyProfile } from "../features/auth/authApi";
import { isSupabaseConfigured, supabase } from "../lib/supabase/client";
import type { AuthProfile } from "../types/auth";
import type { User } from "../types/user";

export function AuthProvider({ children }: PropsWithChildren) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshProfile = useCallback(async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setAuthUser(null);
      setProfile(null);
      return null;
    }
    setAuthUser(data.user);
    const nextProfile = await getMyProfile();
    setProfile(nextProfile);
    return nextProfile;
  }, []);
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }
    const load = async () => {
      try {
        await refreshProfile();
      } catch {
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthUser(session?.user ?? null);
        if (!session?.user) setProfile(null);
      },
    );
    return () => subscription.subscription.unsubscribe();
  }, [refreshProfile]);
  const signInWithGoogle = useCallback(async (returnTo = "/") => {
    if (!supabase) throw new Error("Supabase has not been configured.");
    window.sessionStorage.setItem("isri-auth-return-to", returnTo);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }, []);
  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthUser(null);
    setProfile(null);
  }, []);
  const user = useMemo<User | null>(
    () =>
      profile?.approvalStatus === "approved" && profile.role
        ? { id: profile.id, name: profile.fullName, role: profile.role }
        : null,
    [profile],
  );
  const value = useMemo(
    () => ({
      authUser,
      profile,
      user,
      isLoading,
      signInWithGoogle,
      signOut,
      refreshProfile,
    }),
    [
      authUser,
      profile,
      user,
      isLoading,
      signInWithGoogle,
      signOut,
      refreshProfile,
    ],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
