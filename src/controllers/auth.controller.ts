import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { RegisterRequestBody, LoginRequestBody } from '../types/auth.types';
import { sendSuccess } from '../utils/response.utils';

export const register = async (
  req: Request<object, object, RegisterRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<object, object, LoginRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await authService.getProfile(req.user!.userId);
    sendSuccess(res, profile, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};
