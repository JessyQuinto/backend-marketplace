import { Request, Response, NextFunction } from 'express';
import { UserProfile } from '../models/user';
import { db, auth } from '../config/firebase'; // Import auth and db

declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}

// THIS IS THE CORRECTED HIGHER-ORDER FUNCTION PATTERN
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if Firebase was initialized correctly
  if (!auth || !db) {
    return res.status(503).json({
      success: false,
      error: 'Servicio no disponible. La configuración de Firebase no está completa.',
      code: 'SERVICE_UNAVAILABLE'
    });
  }

  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autorización no encontrado.',
      code: 'UNAUTHORIZED'
    });
  }

  const token = authorization.split('Bearer ')[1];

  // The async logic is now properly contained
  (async () => {
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado.',
          code: 'USER_NOT_FOUND'
        });
      }

      const userProfile: UserProfile = {
        id: userDoc.id,
        ...userDoc.data()
      } as UserProfile;

      req.user = userProfile;
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      if (error.code === 'auth/id-token-expired') {
          return res.status(401).json({ success: false, error: 'Token expirado.', code: 'TOKEN_EXPIRED'});
      }
      return res.status(401).json({
        success: false,
        error: 'Token inválido.',
        code: 'INVALID_TOKEN'
      });
    }
  })();
};
