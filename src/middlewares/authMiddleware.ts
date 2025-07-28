import { Response, NextFunction } from 'express';
import { UserProfile } from '../models/user';
import { db, auth } from '../config/firebase';
import { AuthenticatedRequest } from '../types/express'; // Importar el tipo

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    req.user = {
      id: userDoc.id,
      ...userDoc.data()
    } as UserProfile;

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
};
