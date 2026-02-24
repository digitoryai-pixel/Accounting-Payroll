import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { UnauthorizedError, ForbiddenError } from '../errors';

export interface AuthUser {
  id: string;
  organizationId: string;
  outletIds: string[];
  role: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function authorize(...requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const hasPermission = requiredPermissions.every((perm) =>
      req.user!.permissions.includes(perm)
    );

    if (!hasPermission) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}

export function outletAccess(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw new UnauthorizedError();
  if (req.user.role === 'SUPER_ADMIN') return next();

  const outletId = req.params.outletId || req.body?.outletId || req.query.outletId;
  if (outletId && !req.user.outletIds.includes(outletId as string)) {
    throw new ForbiddenError('No access to this outlet');
  }

  next();
}
