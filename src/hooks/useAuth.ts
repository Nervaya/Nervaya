"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { ApiResponse } from "@/lib/utils/response.util";
import { ROLES, Role } from "@/lib/constants/roles";
import { ROUTES } from "@/utils/routesConstants";

interface AuthData {
  user: {
    _id: string;
    email: string;
    name: string;
    role: Role;
  };
  token: string;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuthSuccess = (data: AuthData) => {
    // Note: Cookie is now set server-side with HttpOnly flag for security
    // The token in the response is only used for verification
    // We don't set it client-side anymore to prevent XSS attacks

    // Dispatch custom event to notify Navbar and other components
    if (typeof window !== "undefined") {
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new CustomEvent("auth-state-changed"));
    }

    if (data.user.role === ROLES.ADMIN) {
      router.push(ROUTES.ADMIN_DASHBOARD);
    } else {
      router.push(ROUTES.HOME);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = (await api.post("/auth/signup", {
        email,
        password,
        name,
      })) as ApiResponse<AuthData>;

      if (response.success && response.data) {
        handleAuthSuccess(response.data);
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = (await api.post("/auth/login", {
        email,
        password,
      })) as ApiResponse<AuthData>;

      if (response.success && response.data) {
        handleAuthSuccess(response.data);
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      // Ensure we propagate the error message cleanly
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Call logout API endpoint to properly clear server-side cookie
      await api.post("/auth/logout");
    } catch (error) {
      // Even if API call fails, clear client-side state
      // The cookie is HttpOnly so we can't clear it client-side, but we can still update UI
      console.error("Logout API call failed:", error);
    } finally {
      setLoading(false);
    }

    // Dispatch custom event to notify Navbar and other components
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn");
      window.dispatchEvent(new CustomEvent("auth-state-changed"));
    }

    router.push(ROUTES.LOGIN);
  };

  return { signup, login, logout, loading, error };
}
