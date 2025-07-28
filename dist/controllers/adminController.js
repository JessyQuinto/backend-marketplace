"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactivateUser = exports.suspendUser = exports.rejectSeller = exports.approveSeller = exports.listUsers = void 0;
const firebase_1 = require("../config/firebase");
const checkDb = (res) => {
    if (!firebase_1.db) {
        res.status(503).json({ success: false, error: 'Servicio no disponible. La configuración de Firebase no está completa.', code: 'SERVICE_UNAVAILABLE' });
        return false;
    }
    return true;
};
const listUsers = async (req, res) => {
    if (!checkDb(res))
        return;
    try {
        const usersSnapshot = await firebase_1.db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => doc.data());
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al listar usuarios', code: 'LIST_USERS_ERROR' });
    }
};
exports.listUsers = listUsers;
const approveSeller = async (req, res) => {
    if (!checkDb(res))
        return;
    try {
        await firebase_1.db.collection('users').doc(req.params.id).update({ isApproved: true });
        res.status(200).json({ success: true, message: 'Vendedor aprobado' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al aprobar vendedor', code: 'APPROVE_SELLER_ERROR' });
    }
};
exports.approveSeller = approveSeller;
const rejectSeller = async (req, res) => {
    if (!checkDb(res))
        return;
    try {
        await firebase_1.db.collection('users').doc(req.params.id).update({ isApproved: false });
        res.status(200).json({ success: true, message: 'Vendedor rechazado' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al rechazar vendedor', code: 'REJECT_SELLER_ERROR' });
    }
};
exports.rejectSeller = rejectSeller;
const suspendUser = async (req, res) => {
    if (!checkDb(res))
        return;
    res.status(200).json({ success: true, message: 'Usuario suspendido (placeholder)' });
};
exports.suspendUser = suspendUser;
const reactivateUser = async (req, res) => {
    if (!checkDb(res))
        return;
    res.status(200).json({ success: true, message: 'Usuario reactivado (placeholder)' });
};
exports.reactivateUser = reactivateUser;
//# sourceMappingURL=adminController.js.map