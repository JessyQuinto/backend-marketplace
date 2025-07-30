import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';

export const verifyToken = (req: AuthenticatedRequest, res: Response) => {
    console.log('✅ AuthController: Token verificado exitosamente');
    console.log('👤 Usuario autenticado:', req.user.email);
    
    // Devolver el perfil completo del usuario
    res.status(200).json({
        success: true,
        data: req.user
    });
};

export const refreshToken = (req: Request, res: Response) => {
    // Firebase SDKs automatically handle token refresh.
    // This endpoint is for clients that need to manually refresh tokens.
    // The actual token refresh logic should be handled by the client-side Firebase SDK.
    res.status(200).json({
        success: true,
        message: 'El cliente debe refrescar el token usando el SDK de Firebase.'
    });
}

// Nuevo endpoint para registro (opcional, ya que Firebase Auth maneja el registro)
export const register = async (req: Request, res: Response) => {
    try {
        // Este endpoint es principalmente para sincronización con el backend
        // El registro real se maneja en Firebase Auth
        const { userProfile } = req.body;
        
        if (!userProfile || !userProfile.id) {
            return res.status(400).json({
                success: false,
                error: 'Perfil de usuario requerido',
                code: 'MISSING_USER_PROFILE'
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await db.collection('users').doc(userProfile.id).get();
        
        if (existingUser.exists) {
            return res.status(200).json({
                success: true,
                message: 'Usuario ya existe en el sistema',
                data: existingUser.data()
            });
        }

        // Crear el perfil en Firestore
        await db.collection('users').doc(userProfile.id).set({
            ...userProfile,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: userProfile
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            code: 'REGISTRATION_ERROR'
        });
    }
};
