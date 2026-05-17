import { z } from 'zod';
import { UserRole } from '../types/user.types';

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ message: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .trim(),
    email: z
      .string({ message: 'Email is required' })
      .email('Invalid email format')
      .toLowerCase(),
    password: z
      .string({ message: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    role: z.nativeEnum(UserRole).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .email('Invalid email format'),
    password: z.string({ message: 'Password is required' }),
  }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
