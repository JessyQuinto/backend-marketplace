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
    let userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      // Crear perfil de usuario automáticamente si no existe
      const newUserProfile = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Usuario',
        role: 'buyer' as const,
        isApproved: true, // Los buyers se aprueban automáticamente
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.collection('users').doc(decodedToken.uid).set(newUserProfile);
      
      // Enviar correo de bienvenida solo cuando se crea un usuario por primera vez
      try {
        // Simular envío de correo de bienvenida (en producción usarías un servicio de email)
        console.log('🎉 Enviando correo de bienvenida a:', newUserProfile.email);
        console.log('📧 Template de bienvenida para:', newUserProfile.name);
        
        // Aquí podrías integrar con un servicio de email como SendGrid, Mailgun, etc.
        // await emailService.sendWelcomeEmail(newUserProfile);
        
        console.log('✅ Correo de bienvenida enviado exitosamente');
      } catch (emailError) {
        console.warn('⚠️ Error enviando correo de bienvenida:', emailError);
        // No interrumpimos el flujo por este error
      }
      
      // Refrescar el documento para obtener los datos recién creados
      userDoc = await db.collection('users').doc(decodedToken.uid).get();
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
