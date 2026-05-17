import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  SALES_USER = 'sales_user',
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserPublic {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
