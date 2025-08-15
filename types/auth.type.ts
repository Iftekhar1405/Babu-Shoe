export interface User {
  _id: string;
  name: string;
  phoneNumber: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum Role {
  USER = "user",
  ADMIN = "admin",
  MANAGER = "manager",
}

export interface AuthResponse {
  access_token: string;
  user: User;
}


export interface RegisterData {
  name: string;
  phoneNumber: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
export interface LoginData {
  phoneNumber: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  phoneNumber: string;
  role: string;
  name: string;
  iat?: number;
  exp?: number;
}
