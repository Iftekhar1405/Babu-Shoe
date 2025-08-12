export interface User {
  _id: string;
  name: string;
  phoneNumber: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
