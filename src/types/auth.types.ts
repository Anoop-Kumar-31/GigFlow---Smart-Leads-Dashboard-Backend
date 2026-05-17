import { UserRole } from './user.types';

export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}
