"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSeller = exports.updateProfile = exports.getProfile = void 0;
const firebase_1 = require("../config/firebase");
const getProfile = (req, res) => {
    // Gracias al authMiddleware, req.user está garantizado y correctamente tipado.
    res.status(200).json({ success: true, data: req.user });
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    const userId = req.user.id;
    // req.body ahora está fuertemente tipado como UpdateProfileDto gracias al middleware.
    // No hay campos inseguros como 'role' o 'isApproved'.
    const updateData = req.body;
    try {
        await firebase_1.db.collection('users').doc(userId).update({
            ...updateData,
            updatedAt: new Date().toISOString(),
        });
        res.status(200).json({ success: true, message: 'Perfil actualizado exitosamente.' });
    }
    catch (error) {
        console.error('Error en updateProfile:', error);
        res.status(500).json({ success: false, error: 'Ocurrió un error al actualizar tu perfil.', code: 'UPDATE_PROFILE_ERROR' });
    }
};
exports.updateProfile = updateProfile;
const registerSeller = async (req, res) => {
    const user = req.user;
    if (user.role === 'vendedor') {
        return res.status(400).json({ success: false, error: 'Ya eres un vendedor.', code: 'ALREADY_SELLER' });
    }
    if (user.role === 'admin') {
        return res.status(400).json({ success: false, error: 'Un administrador no puede registrarse como vendedor.', code: 'ADMIN_CANNOT_BE_SELLER' });
    }
    // req.body está garantizado y tipado como RegisterSellerDto.
    const sellerApplicationData = req.body;
    try {
        await firebase_1.db.collection('users').doc(user.id).update({
            ...sellerApplicationData,
            role: 'seller',
            isApproved: false,
            updatedAt: new Date().toISOString(),
        });
        res.status(200).json({
            success: true,
            message: 'Tu solicitud para convertirte en vendedor ha sido enviada. Recibirás una notificación cuando sea revisada.'
        });
    }
    catch (error) {
        console.error('Error en registerSeller:', error);
        res.status(500).json({ success: false, error: 'Ocurrió un error al procesar tu solicitud.', code: 'REGISTER_SELLER_ERROR' });
    }
};
exports.registerSeller = registerSeller;
//# sourceMappingURL=userController.js.map