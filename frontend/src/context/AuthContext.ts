import { createContext } from "react";
// import type { AuthContextInterface, AuthObject, LoginProps } from "../types/Authtypes";

import type { AuthContextType, LoginProps } from "../types/auth";
import type { AuthState } from "../types/auth";

const defaultAuthContext: AuthContextType = {
  auth: null,
  setAuth: () => {
    throw new Error("setAuth function must be overridden in AuthProvider");
  },
  login: async (_: LoginProps): Promise<AuthState> => {
    throw new Error("login function must be overridden in AuthProvider");
  },
  logout: async (): Promise<void> => {
    throw new Error("logout function must be overridden in AuthProvider");
  },
  loading:false
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);
