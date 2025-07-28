import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { db } from '../config/firebase';

export const getProfile = (req: AuthenticatedRequest, res: Response) => {
    // El middleware de autenticación ya ha cargado el perfil del usuario.
    // Simplemente lo devolvemos.
    res.status(200).json({ success: true, data: req.user });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const { body } = req;

    // --- Medida de Seguridad Crítica ---
    // Un usuario NUNCA debe poder cambiar su rol, ID, email o estado de aprobación.
    // Creamos un objeto de datos seguro sin esos campos.
    const safeUpdateData = {
        name: body.name,
        phone: body.phone,
        address: body.address,
        businessName: body.businessName,
        bio: body.bio,
        updatedAt: new Date().toISOString()
    };
    
    // Filtramos cualquier campo 'undefined' para no sobrescribir datos existentes con nada.
    Object.keys(safeUpdateData).forEach(key => safeUpdateData[key] === undefined && delete safeUpdateData[key]);

    if (Object.keys(safeUpdateData).length === 1 && safeUpdateData.updatedAt) {
        return res.status(400).json({ success: false, error: 'No se proporcionaron datos válidos para actualizar.', code: 'BAD_REQUEST' });
    }

    try {
        await db.collection('users').doc(userId).update(safeUpdateData);
        res.status(200).json({ success: true, message: 'Perfil actualizado exitosamente.' });
    } catch (error) {
        console.error('Error en updateProfile:', error);
        res.status(500).json({ success: false, error: 'Ocurrió un error al actualizar tu perfil.', code: 'UPDATE_PROFILE_ERROR' });
    }
};

export const registerSeller = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    // Verificar que el usuario no sea ya un vendedor o un administrador.
    if (user.role === 'seller') {
        return res.status(400).json({ success: false, error: 'Ya eres un vendedor.', code: 'ALREADY_SELLER' });
    }
    if (user.role === 'admin') {
        return res.status(400).json({ success: false, error: 'Un administrador no puede registrarse como vendedor.', code: 'ADMIN_CANNOT_BE_SELLER' });
    }

    // Datos para la solicitud de vendedor
    const sellerApplicationData = {
        role: 'seller',
        isApproved: false, // La aprobación es manual por parte del admin
        businessName: req.body.businessName,
        bio: req.body.bio,
        updatedAt: new Date().toISOString()
    };
    
    // Validar que se envíen los campos mínimos
    if (!sellerApplicationData.businessName) {
         return res.status(400).json({ success: false, error: 'El nombre del negocio es requerido.', code: 'BAD_REQUEST' });
    }

    try {
        await db.collection('users').doc(user.id).update(sellerApplicationData);
        res.status(200).json({ 
            success: true, 
            message: 'Tu solicitud para convertirte en vendedor ha sido enviada. Recibirás una notificación cuando sea revisada.' 
        });
    } catch (error) {
        console.error('Error en registerSeller:', error);
        res.status(500).json({ success: false, error: 'Ocurrió un error al procesar tu solicitud.', code: 'REGISTER_SELLER_ERROR' });
    }
};
