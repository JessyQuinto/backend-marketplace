import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../types/express';

// Función helper para actualizar el estado del usuario y enviar respuesta
const updateUserStatus = async (res: Response, userId: string, statusChange: object, successMessage: string, errorCode: string) => {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ success: false, error: 'El usuario no existe.', code: 'USER_NOT_FOUND' });
        }

        await userRef.update({ ...statusChange, updatedAt: new Date().toISOString() });
        
        res.status(200).json({ success: true, message: successMessage });
    } catch (error) {
        console.error(`Error en ${errorCode}:`, error);
        res.status(500).json({ success: false, error: `Error al ${successMessage.toLowerCase()}`, code: errorCode });
    }
};

export const listUsers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error en listUsers:', error);
        res.status(500).json({ success: false, error: 'Error al obtener la lista de usuarios.', code: 'LIST_USERS_ERROR' });
    }
};

export const approveSeller = (req: AuthenticatedRequest, res: Response) => {
    updateUserStatus(res, req.params.id, { isApproved: true }, 'Vendedor aprobado exitosamente.', 'APPROVE_SELLER_ERROR');
};

export const rejectSeller = (req: AuthenticatedRequest, res: Response) => {
    updateUserStatus(res, req.params.id, { isApproved: false }, 'Solicitud de vendedor rechazada.', 'REJECT_SELLER_ERROR');
};

export const suspendUser = (req: AuthenticatedRequest, res: Response) => {
    updateUserStatus(res, req.params.id, { suspended: true }, 'Usuario suspendido correctamente.', 'SUSPEND_USER_ERROR');
};

export const reactivateUser = (req: AuthenticatedRequest, res: Response) => {
    updateUserStatus(res, req.params.id, { suspended: false }, 'Usuario reactivado correctamente.', 'REACTIVATE_USER_ERROR');
};
