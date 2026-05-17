import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user.types';

export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access this resource',
      });
      return;
    }

    next();
  };
