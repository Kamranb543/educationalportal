"use client";

// Mock authentication engine (frontend demo only — no real credentials).
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Role, User } from "@/types";
import { users } from "@/data/users";
import { config, terminology } from "@/lib/config";

const STORAGE_KEY = "emp.auth.currentUserId";
const AUTH_SESSION_FLAG = "emp.auth.session";

/** Human labels per role. Faculty/student labels honor config terminology. */
export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  teacher: terminology.teacherLabel,
  student: terminology.studentLabel,
};

export const ALL_ROLES: Role[] = ["super_admin", "admin", "teacher", "student"];

/** Label helper that tolerates null (unauthenticated). */
export function roleLabel(role: Role | null): string {
  return role === null ? "Guest" : ROLE_LABELS[role];
}

interface AuthContextValue {
  /** Null when no session exists (unauthenticated). */
  currentUser: User | null;
  currentRole: Role | null;
  isAuthenticated: boolean;
  availableUsers: User[];
  usersForRole: (role: Role) => User[];
  /** Explicit credential-less sign-in by mock account id. */
  login: (userId: string) => void;
  /** Email/password sign-in — returns true on success, false on failure. */
  loginWithCredentials: (email: string, password: string) => boolean;
  logout: () => void;
  hydrated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function userById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore a persisted session after mount (localStorage is client-only).
  useEffect(() => {
    try {
      const active = window.localStorage.getItem(AUTH_SESSION_FLAG);
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (active === "1" && saved && userById(saved)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe hydration from localStorage
        setCurrentUserId(saved);
      }
    } catch {
      /* storage unavailable — stay unauthenticated */
    }
    setHydrated(true);
  }, []);

  // Persist every switch while a session is active.
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (currentUserId) {
        window.localStorage.setItem(AUTH_SESSION_FLAG, "1");
        window.localStorage.setItem(STORAGE_KEY, currentUserId);
      } else {
        window.localStorage.removeItem(AUTH_SESSION_FLAG);
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore persistence failures in demo */
    }
  }, [currentUserId, hydrated]);

  const login = useCallback((userId: string) => {
    if (userById(userId)) setCurrentUserId(userId);
  }, []);

  const loginWithCredentials = useCallback((email: string, password: string): boolean => {
    const match = users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password,
    );
    if (match) {
      setCurrentUserId(match.id);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setCurrentUserId(null), []);

  const usersForRole = useCallback(
    (role: Role) => users.filter((u) => u.role === role),
    [],
  );

  const currentUser = useMemo<User | null>(
    () => (currentUserId ? userById(currentUserId) ?? null : null),
    [currentUserId],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      currentRole: currentUser?.role ?? null,
      isAuthenticated: currentUser !== null,
      availableUsers: users,
      usersForRole,
      login,
      loginWithCredentials,
      logout,
      hydrated,
    }),
    [currentUser, usersForRole, login, loginWithCredentials, logout, hydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

/** Institution identity is exposed via config; re-exported for shell convenience. */
export const institutionName = config.identity.name;
