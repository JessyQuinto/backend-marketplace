import { Request, Response, NextFunction } from 'express';

export const authorizationMiddleware = (roles: Array<'admin' | 'buyer' | 'seller'>, checkApproved = false) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado.',
        code: 'UNAUTHENTICATED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para acceder a este recurso.',
        code: 'FORBIDDEN'
      });
    }

    if (checkApproved && req.user.role === 'seller' && !req.user.isApproved) {
        return res.status(403).json({
            success: false,
            error: 'Tu cuenta de vendedor no ha sido aprobada.',
            code: 'NOT_APPROVED'
        });
    }

    next();
  };
};
