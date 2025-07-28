import { Request, Response } from 'express';
import { db } from '../config/firebase';

const checkDb = (res: Response) => {
    if (!db) {
        res.status(503).json({ success: false, error: 'Servicio no disponible. La configuración de Firebase no está completa.', code: 'SERVICE_UNAVAILABLE' });
        return false;
    }
    return true;
}

export const getProfile = (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: req.user });
};

export const updateProfile = async (req: Request, res: Response) => {
    if (!checkDb(res)) return;
    try {
        const { role, isApproved, ...updateData } = req.body;
        await db.collection('users').doc(req.user.id).update(updateData);
        res.status(200).json({ success: true, message: 'Perfil actualizado' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al actualizar perfil', code: 'UPDATE_PROFILE_ERROR' });
    }
};

export const registerSeller = async (req: Request, res: Response) => {
    if (!checkDb(res)) return;
    try {
        await db.collection('users').doc(req.user.id).update({
            role: 'seller',
            isApproved: false,
            ...req.body
        });
        res.status(200).json({ success: true, message: 'Solicitud para ser vendedor registrada. Pendiente de aprobación.' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al registrar como vendedor', code: 'REGISTER_SELLER_ERROR' });
    }
};
