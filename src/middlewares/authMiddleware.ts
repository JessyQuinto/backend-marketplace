import { Response, NextFunction } from 'express';
import { UserProfile } from '../models/user';
import { db, auth } from '../config/firebase';
import { AuthenticatedRequest } from '../types/express'; // Importar el tipo

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('🔐 AuthMiddleware: Iniciando verificación de token');
  console.log('🔐 AuthMiddleware: URL:', req.url);
  console.log('🔐 AuthMiddleware: Método:', req.method);
  
  if (!auth || !db) {
    console.error('❌ AuthMiddleware: Firebase no está configurado');
    return res.status(503).json({
      success: false,
      error: 'Servicio no disponible. La configuración de Firebase no está completa.',
      code: 'SERVICE_UNAVAILABLE'
    });
  }

  const { authorization } = req.headers;
  console.log('🔐 AuthMiddleware: Headers recibidos:', { 
    authorization: authorization ? 'Bearer [TOKEN]' : 'No token',
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent']
  });

  if (!authorization || !authorization.startsWith('Bearer ')) {
    console.error('❌ AuthMiddleware: Token de autorización no encontrado');
    return res.status(401).json({
      success: false,
      error: 'Token de autorización no encontrado.',
      code: 'UNAUTHORIZED'
    });
  }

  const token = authorization.split('Bearer ')[1];
  console.log('🔐 AuthMiddleware: Token extraído, longitud:', token.length);
  console.log('🔐 AuthMiddleware: Primeros 20 caracteres del token:', token.substring(0, 20) + '...');

  try {
    console.log('🔐 AuthMiddleware: Verificando token con Firebase...');
    const decodedToken = await auth.verifyIdToken(token);
    console.log('✅ AuthMiddleware: Token verificado exitosamente para usuario:', decodedToken.uid);
    console.log('✅ AuthMiddleware: Email del usuario:', decodedToken.email);
    console.log('✅ AuthMiddleware: Nombre del usuario:', decodedToken.name);
    
    let userDoc = await db.collection('users').doc(decodedToken.uid).get();
    console.log('🔍 AuthMiddleware: Usuario existe en Firestore:', userDoc.exists);

    if (!userDoc.exists) {
      console.log('🆕 AuthMiddleware: Creando nuevo perfil de usuario en Firestore...');
      // Crear perfil de usuario automáticamente si no existe
      const newUserProfile = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Usuario',
        role: 'buyer' as const, // Cambiado de 'comprador' a 'buyer'
        isApproved: true, // Los buyers se aprueban automáticamente
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('📝 AuthMiddleware: Perfil a crear:', newUserProfile);

      await db.collection('users').doc(decodedToken.uid).set(newUserProfile);
      console.log('✅ AuthMiddleware: Perfil de usuario creado en Firestore');
      
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
      console.log('🔄 AuthMiddleware: Documento refrescado después de crear perfil');
    } else {
      console.log('✅ AuthMiddleware: Usuario ya existe en Firestore');
      console.log('📄 AuthMiddleware: Datos del usuario:', userDoc.data());
    }

    req.user = {
      id: userDoc.id,
      ...userDoc.data()
    } as UserProfile;
    
    console.log('✅ AuthMiddleware: Usuario autenticado exitosamente:', req.user.email);

    next();
  } catch (error) {
    console.error("❌ AuthMiddleware Error:", error);
    console.error("❌ AuthMiddleware Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    if (error.code === 'auth/id-token-expired') {
        console.error('❌ AuthMiddleware: Token expirado');
        return res.status(401).json({ success: false, error: 'Token expirado.', code: 'TOKEN_EXPIRED'});
    }
    console.error('❌ AuthMiddleware: Token inválido');
    return res.status(401).json({
      success: false,
      error: 'Token inválido.',
      code: 'INVALID_TOKEN'
    });
  }
};
