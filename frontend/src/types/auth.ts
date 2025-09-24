export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthState {
  tokens: AuthTokens | null;
  user_info: any;
  user_list: any[];
  user_permissions: any[];
}

export interface AuthContextType {
  auth: AuthState | null;
  setAuth: React.Dispatch<React.SetStateAction<AuthState | null>>;
  login: (props: LoginProps) => Promise<any>;
  logout: () => void;
  loading: boolean;
}

export interface LoginProps {
  username?: string;
  password?: string;
}
