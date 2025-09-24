import { useCallback, useEffect, useState, type PropsWithChildren, type ReactNode } from "react";
import toast, { Toaster } from "react-hot-toast";
import API from "../api/axios";
import type { AuthState, LoginProps } from "../types/auth";
import { AuthContext } from "./AuthContext";

const AUTH_URL = "login/";
const REFRESH_URL = "refresh/";
const LOGOUT_URL = "logout";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }: PropsWithChildren) => {
  const tokens = JSON.parse(localStorage.getItem("authTokens") || "{}");
  const [auth, setAuth] = useState<AuthState | null>({
    tokens: tokens,
    user_info: null,
    user_list: [],
    user_permissions: []
  });
  const [loading, setLoading] = useState<boolean>(true); // Add a loading state

  const login = async ({ username, password }: LoginProps): Promise<AuthObject> => {
    try {
      const res = await API.post(AUTH_URL, { username, password });
      const tokens = res.data;

      localStorage.setItem("authTokens", JSON.stringify(tokens));

      const userInfo = await API.get("users/info/");
      const user_list = await API.get("users/list/");
      const authData: AuthState = {
        tokens,
        user_info: userInfo?.data,
        user_list: user_list?.data,
        user_permissions: userInfo?.data?.permissions
      };
      
      setAuth(authData);
      return tokens;
    } catch (error) {
      console.error("Login failed:", error);
      toast("Invalid credentials", { duration: 3000 });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const tokens = JSON.parse(localStorage.getItem("authTokens") || "{}");
      if (tokens.refresh) {
        await API.post(LOGOUT_URL, { refresh: tokens.refresh });
      }
    } catch (err) {
      console.error("Logout failed or already blacklisted", err);
    }
    localStorage.removeItem("authTokens");
    setAuth(null);
  };

  const refreshToken = useCallback(async () => {
    const stored = localStorage.getItem("authTokens");
    if (!stored) return;

    const tokens = JSON.parse(stored);
    if (!tokens.refresh) return;

    try {
      const res = await API.post(REFRESH_URL, { refresh: tokens.refresh });
      const newTokens = { access: res.data.access, refresh: tokens.refresh };

      localStorage.setItem("authTokens", JSON.stringify(newTokens));
      setAuth((prev) => (prev ? { ...prev, tokens: newTokens } : null));
    } catch (error) {
      console.error("Token refresh failed", error);
      logout();
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem("authTokens");
      if (stored) {
        const tokens = JSON.parse(stored);
        try {
          const userInfo = await API.get("users/info/");
          const user_list = await API.get("users/list/");
          setAuth({
            tokens,
            user_info: userInfo.data,
            user_list: user_list.data,
            user_permissions: userInfo?.data?.permissions
          });
        } catch (err) {
          console.error("Failed to fetch user info", err);
          setAuth(null);
        }
      }
      setLoading(false); // Set loading to false once the state is initialized
    };

    initAuth();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshToken();
    }, 4 * 60 * 1000); // Refresh token every 4 minutes
    return () => clearInterval(interval);
  }, [refreshToken]);

  return (
    <AuthContext.Provider value={{ loading , auth, setAuth, login, logout }}>
      <Toaster
        toastOptions={{
        duration:3000,
        }}
      />
      {!loading && children} {/* Only render children when auth is initialized */}
    </AuthContext.Provider>
  );
};

export default AuthContext;
