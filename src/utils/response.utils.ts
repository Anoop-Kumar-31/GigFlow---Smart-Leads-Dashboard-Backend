import { Response } from 'express';
import { ApiResponse, PaginatedResponse, PaginationMeta } from '../types/api.types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message = 'Success'
): void => {
  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    pagination,
  };
  res.status(200).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500
): void => {
  const response: ApiResponse<null> = {
    success: false,
    message,
    error: message,
  };
  res.status(statusCode).json(response);
};
