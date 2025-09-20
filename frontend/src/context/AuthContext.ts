import { createContext } from "react";
import type { AuthContextInterface, AuthObject, LoginProps } from "../types/Authtypes";

const defaultAuthContext: AuthContextInterface = {
  auth: null,
  setAuth: () => {
    throw new Error("setAuth function must be overridden in AuthProvider");
  },
  login: async (_: LoginProps): Promise<AuthObject> => {
    throw new Error("login function must be overridden in AuthProvider");
  },
  logout: async (): Promise<void> => {
    throw new Error("logout function must be overridden in AuthProvider");
  },
  loading:false
};

export const AuthContext = createContext<AuthContextInterface>(defaultAuthContext);
