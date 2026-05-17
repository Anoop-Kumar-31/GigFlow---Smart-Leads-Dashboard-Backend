import { UserModel } from '../models/User.model';
import { RegisterRequestBody, LoginRequestBody, AuthTokenResponse } from '../types/auth.types';
import { IUserPublic } from '../types/user.types';
import { generateToken } from '../utils/jwt.utils';

export class AuthService {
  async register(data: RegisterRequestBody): Promise<AuthTokenResponse> {
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      const error = new Error('User already exists with this email') as Error & {
        statusCode: number;
      };
      error.statusCode = 409;
      throw error;
    }

    const user = await UserModel.create(data);

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(data: LoginRequestBody): Promise<AuthTokenResponse> {
    const user = await UserModel.findOne({ email: data.email }).select('+password');

    if (!user || !(await user.comparePassword(data.password))) {
      const error = new Error('Invalid email or password') as Error & {
        statusCode: number;
      };
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(userId: string): Promise<IUserPublic> {
    const user = await UserModel.findById(userId).select('-password');
    if (!user) {
      const error = new Error('User not found') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

export const authService = new AuthService();
