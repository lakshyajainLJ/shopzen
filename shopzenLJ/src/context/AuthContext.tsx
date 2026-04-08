import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiLogin, apiRegister, getStoredUser, saveToken, clearToken } from "@/services/api";

interface AuthUser { id: string; name: string; email: string; role: string; }

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  useEffect(() => { const u = getStoredUser(); if (u) setUser(u); }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiLogin(email, password);
      saveToken(res.token);
      setUser(getStoredUser()!);
      return { success: true, message: "Login successful!" };
    } catch (err: any) {
      return { success: false, message: err.message || "Invalid email or password" };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await apiRegister(name, email, password);
      return { success: true, message: "Account created! Please sign in." };
    } catch (err: any) {
      return { success: false, message: err.message || "Registration failed" };
    }
  };

  const logout = () => { clearToken(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin: user?.role === "admin", login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
