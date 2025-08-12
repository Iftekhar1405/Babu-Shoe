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

export interface JwtPayload {
  sub: string;
  phoneNumber: string;
  role: Role;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  phoneNumber: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  phoneNumber: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
