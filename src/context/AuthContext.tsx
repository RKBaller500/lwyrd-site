"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { AuthUser } from "@/types";
import posthog from "posthog-js";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isModalOpen: boolean;
  modalMode: "login" | "signup";
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: "client" | "firm") => Promise<void>;
  logout: () => Promise<void>;
  openModal: (mode?: "login" | "signup", redirectTo?: string) => void;
  closeModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(
  u: User,
  isAdmin = false,
  accessLevel: "none" | "subscription" | "org" = "none",
  role: "client" | "firm" = "client"
): AuthUser {
  return {
    id: u.id,
    email: u.email ?? "",
    name:
      (u.user_metadata?.name as string | undefined) ??
      u.email?.split("@")[0] ??
      "",
    createdAt: u.created_at,
    isAdmin,
    accessLevel,
    role: (u.user_metadata?.role as "client" | "firm" | undefined) ?? role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  // Sets user immediately from session data, then enriches with DB profile in background
  const hydrateUser = useCallback(
    async (supabaseUser: User | null) => {
      if (!supabaseUser) {
        setUser(null);
        posthog.reset();
        return;
      }

      // Set immediately so nav renders without waiting for DB
      const quickUser = toAuthUser(supabaseUser, false, "none", "client");
      setUser(quickUser);

      // Enrich with profile data in background
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, access_level")
        .eq("id", supabaseUser.id)
        .single();

      const authUser = toAuthUser(
        supabaseUser,
        profile?.is_admin ?? false,
        (profile?.access_level as "none" | "subscription" | "org") ?? "none",
        "client"
      );
      setUser(authUser);
      posthog.identify(authUser.id, {
        email: authUser.email,
        name: authUser.name,
        is_admin: authUser.isAdmin,
        access_level: authUser.accessLevel,
      });
    },
    [supabase]
  );

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      await hydrateUser(u);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setIsLoading(false);
      if (error) throw error;
      setIsModalOpen(false);
      if (pendingRedirect) {
        router.push(pendingRedirect);
        setPendingRedirect(null);
      }
    },
    [supabase, pendingRedirect, router]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string, role: "client" | "firm" = "client") => {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      });
      setIsLoading(false);
      if (error) throw error;
      setIsModalOpen(false);
      if (pendingRedirect) {
        router.push(pendingRedirect);
        setPendingRedirect(null);
      }
    },
    [supabase, pendingRedirect, router]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    posthog.reset();
    setUser(null);
    router.push("/");
  }, [supabase, router]);

  const openModal = useCallback((mode: "login" | "signup" = "login", redirectTo?: string) => {
    setModalMode(mode);
    setIsModalOpen(true);
    setPendingRedirect(redirectTo ?? null);
  }, []);

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isModalOpen,
        modalMode,
        isLoading,
        login,
        signup,
        logout,
        openModal,
        closeModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
