"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSeller = exports.updateProfile = exports.getProfile = void 0;
const firebase_1 = require("../config/firebase");
const checkDb = (res) => {
    if (!firebase_1.db) {
        res.status(503).json({ success: false, error: 'Servicio no disponible. La configuración de Firebase no está completa.', code: 'SERVICE_UNAVAILABLE' });
        return false;
    }
    return true;
};
const getProfile = (req, res) => {
    res.status(200).json({ success: true, data: req.user });
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    if (!checkDb(res))
        return;
    try {
        const { role, isApproved, ...updateData } = req.body;
        await firebase_1.db.collection('users').doc(req.user.id).update(updateData);
        res.status(200).json({ success: true, message: 'Perfil actualizado' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al actualizar perfil', code: 'UPDATE_PROFILE_ERROR' });
    }
};
exports.updateProfile = updateProfile;
const registerSeller = async (req, res) => {
    if (!checkDb(res))
        return;
    try {
        await firebase_1.db.collection('users').doc(req.user.id).update({
            role: 'seller',
            isApproved: false,
            ...req.body
        });
        res.status(200).json({ success: true, message: 'Solicitud para ser vendedor registrada. Pendiente de aprobación.' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al registrar como vendedor', code: 'REGISTER_SELLER_ERROR' });
    }
};
exports.registerSeller = registerSeller;
//# sourceMappingURL=userController.js.map