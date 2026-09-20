"use client";

import * as React from "react";
import { apiClient } from "@/lib/api-client";

interface AuthUser {
  id: string;
  tenant_id: string | null;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = "apotheka_access_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadCurrentUser = React.useCallback(async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiClient.setToken(token);
    try {
      const me = await apiClient.get<AuthUser>("/api/auth/me");
      setUser(me);
    } catch {
      // token expired/invalid — clear it silently, user will hit the login page
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      apiClient.setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<{ access_token: string; refresh_token: string }>(
      "/api/auth/login",
      { email, password }
    );
    localStorage.setItem(TOKEN_STORAGE_KEY, res.access_token);
    apiClient.setToken(res.access_token);
    const me = await apiClient.get<AuthUser>("/api/auth/me");
    setUser(me);
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    apiClient.setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
