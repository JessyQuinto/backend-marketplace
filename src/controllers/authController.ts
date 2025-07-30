import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';

export const verifyToken = (req: AuthenticatedRequest, res: Response) => {
    console.log('✅ AuthController: Token verificado exitosamente');
    console.log('👤 Usuario autenticado:', req.user.email);
    
    // If the middleware passed, the user is authenticated.
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
