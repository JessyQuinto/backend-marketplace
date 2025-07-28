import { Request, Response } from 'express';
import { db } from '../config/firebase';

const checkDb = (res: Response) => {
    if (!db) {
        res.status(503).json({ success: false, error: 'Servicio no disponible. La configuración de Firebase no está completa.', code: 'SERVICE_UNAVAILABLE' });
        return false;
    }
    return true;
}

export const listUsers = async (req: Request, res: Response) => {
    if (!checkDb(res)) return;
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => doc.data());
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al listar usuarios', code: 'LIST_USERS_ERROR' });
    }
};

export const approveSeller = async (req: Request, res: Response) => {
    if (!checkDb(res)) return;
    try {
        await db.collection('users').doc(req.params.id).update({ isApproved: true });
        res.status(200).json({ success: true, message: 'Vendedor aprobado' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al aprobar vendedor', code: 'APPROVE_SELLER_ERROR' });
    }
};

export const rejectSeller = async (req: Request, res: Response) => {
    if (!checkDb(res)) return;
    try {
        await db.collection('users').doc(req.params.id).update({ isApproved: false });
        res.status(200).json({ success: true, message: 'Vendedor rechazado' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al rechazar vendedor', code: 'REJECT_SELLER_ERROR' });
    }
};

export const suspendUser = async (req: Request, res: Response) => {
    if (!checkDb(res)) return;
    res.status(200).json({ success: true, message: 'Usuario suspendido (placeholder)' });
};

export const reactivateUser = async (req: Request, res: Response) => {
    if (!checkDb(res)) return;
    res.status(200).json({ success: true, message: 'Usuario reactivado (placeholder)' });
};
