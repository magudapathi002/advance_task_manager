export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  email: string;
  is_staff: boolean;
  is_superadmin: boolean;
  groups: any[];
  permissions: string[];
}

export type UserInfo = User;

export interface AuthState {
  tokens: AuthTokens;
  user_info: UserInfo | null;
  user_list: UserInfo[] | []
  user_permissions:string[]
}

export interface AuthObject {
  access?: string;
  refresh?: string;
}

export interface LoginProps {
  username: string;
  password: string;
}

export interface AuthContextInterface {
  auth: AuthState | null;
  loading:boolean,
  setAuth: React.Dispatch<React.SetStateAction<AuthState | null>>;
  login: (credentials: LoginProps) => Promise<AuthObject>;
  logout: () => Promise<void>;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  due_date: string;
  priority: string;
  created_by: number;
  assigned_to: number;
}
