"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactivateUser = exports.suspendUser = exports.rejectSeller = exports.approveSeller = exports.listUsers = void 0;
const firebase_1 = require("../config/firebase");
// Función helper para actualizar el estado del usuario y enviar respuesta
const updateUserStatus = async (res, userId, statusChange, successMessage, errorCode) => {
    try {
        const userRef = firebase_1.db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, error: 'El usuario no existe.', code: 'USER_NOT_FOUND' });
        }
        await userRef.update({ ...statusChange, updatedAt: new Date().toISOString() });
        res.status(200).json({ success: true, message: successMessage });
    }
    catch (error) {
        console.error(`Error en ${errorCode}:`, error);
        res.status(500).json({ success: false, error: `Error al ${successMessage.toLowerCase()}`, code: errorCode });
    }
};
const listUsers = async (req, res) => {
    try {
        const usersSnapshot = await firebase_1.db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        console.error('Error en listUsers:', error);
        res.status(500).json({ success: false, error: 'Error al obtener la lista de usuarios.', code: 'LIST_USERS_ERROR' });
    }
};
exports.listUsers = listUsers;
const approveSeller = (req, res) => {
    updateUserStatus(res, req.params.id, { isApproved: true }, 'Vendedor aprobado exitosamente.', 'APPROVE_SELLER_ERROR');
};
exports.approveSeller = approveSeller;
const rejectSeller = (req, res) => {
    updateUserStatus(res, req.params.id, { isApproved: false }, 'Solicitud de vendedor rechazada.', 'REJECT_SELLER_ERROR');
};
exports.rejectSeller = rejectSeller;
const suspendUser = (req, res) => {
    updateUserStatus(res, req.params.id, { suspended: true }, 'Usuario suspendido correctamente.', 'SUSPEND_USER_ERROR');
};
exports.suspendUser = suspendUser;
const reactivateUser = (req, res) => {
    updateUserStatus(res, req.params.id, { suspended: false }, 'Usuario reactivado correctamente.', 'REACTIVATE_USER_ERROR');
};
exports.reactivateUser = reactivateUser;
//# sourceMappingURL=adminController.js.map