import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { db } from '../config/firebase';
import { UpdateProfileDto, RegisterSellerDto } from '../validators/user.validator';

export const getProfile = (req: AuthenticatedRequest, res: Response) => {
    // Gracias al authMiddleware, req.user está garantizado y correctamente tipado.
    res.status(200).json({ success: true, data: req.user });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    // req.body ahora está fuertemente tipado como UpdateProfileDto gracias al middleware.
    // No hay campos inseguros como 'role' o 'isApproved'.
    const updateData: UpdateProfileDto = req.body;

    try {
        await db.collection('users').doc(userId).update({
            ...updateData,
            updatedAt: new Date().toISOString(),
        });
        res.status(200).json({ success: true, message: 'Perfil actualizado exitosamente.' });
    } catch (error) {
        console.error('Error en updateProfile:', error);
        res.status(500).json({ success: false, error: 'Ocurrió un error al actualizar tu perfil.', code: 'UPDATE_PROFILE_ERROR' });
    }
};

export const registerSeller = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (user.role === 'seller') {
        return res.status(400).json({ success: false, error: 'Ya eres un vendedor.', code: 'ALREADY_SELLER' });
    }
    if (user.role === 'admin') {
        return res.status(400).json({ success: false, error: 'Un administrador no puede registrarse como vendedor.', code: 'ADMIN_CANNOT_BE_SELLER' });
    }

    // req.body está garantizado y tipado como RegisterSellerDto.
    const sellerApplicationData: RegisterSellerDto = req.body;

    try {
        await db.collection('users').doc(user.id).update({
            ...sellerApplicationData,
            role: 'seller',
            isApproved: false,
            updatedAt: new Date().toISOString(),
        });
        res.status(200).json({ 
            success: true, 
            message: 'Tu solicitud para convertirte en vendedor ha sido enviada. Recibirás una notificación cuando sea revisada.' 
        });
    } catch (error) {
        console.error('Error en registerSeller:', error);
        res.status(500).json({ success: false, error: 'Ocurrió un error al procesar tu solicitud.', code: 'REGISTER_SELLER_ERROR' });
    }
};
