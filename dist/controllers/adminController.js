"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemStats = exports.suspendProduct = exports.rejectProduct = exports.approveProduct = exports.getReportedProducts = exports.reactivateUser = exports.suspendUser = exports.rejectSeller = exports.approveSeller = exports.getPendingSellers = exports.listUsers = void 0;
const firebase_1 = require("../config/firebase");
const usersCollection = firebase_1.db.collection('users');
const productsCollection = firebase_1.db.collection('products');
// ===== FUNCIONES HELPER =====
// Función helper para actualizar el estado del usuario y enviar respuesta
const updateUserStatus = async (res, userId, statusChange, successMessage, errorCode) => {
    try {
        const userRef = usersCollection.doc(userId);
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
// Función helper para enviar notificaciones por email (simulada)
const sendEmailNotification = async (userEmail, subject, message) => {
    try {
        // Aquí se integraría con un servicio de email como SendGrid, AWS SES, etc.
        console.log(`Email enviado a ${userEmail}: ${subject} - ${message}`);
        return true;
    }
    catch (error) {
        console.error('Error enviando email:', error);
        return false;
    }
};
// ===== ENDPOINTS DE GESTIÓN DE USUARIOS =====
const listUsers = async (req, res) => {
    try {
        const usersSnapshot = await usersCollection.get();
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        console.error('Error en listUsers:', error);
        res.status(500).json({ success: false, error: 'Error al obtener la lista de usuarios.', code: 'LIST_USERS_ERROR' });
    }
};
exports.listUsers = listUsers;
const getPendingSellers = async (req, res) => {
    try {
        const pendingSellersSnapshot = await usersCollection
            .where('role', '==', 'vendedor')
            .where('isApproved', '==', false)
            .orderBy('createdAt', 'desc')
            .get();
        const pendingSellers = pendingSellersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json({ success: true, data: pendingSellers });
    }
    catch (error) {
        console.error('Error en getPendingSellers:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener vendedores pendientes.',
            code: 'GET_PENDING_SELLERS_ERROR'
        });
    }
};
exports.getPendingSellers = getPendingSellers;
const approveSeller = async (req, res) => {
    const { id: userId } = req.params;
    const { reason } = req.body;
    try {
        const userRef = usersCollection.doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'El usuario no existe.',
                code: 'USER_NOT_FOUND'
            });
        }
        const userData = userDoc.data();
        if (userData.role !== 'vendedor') {
            return res.status(400).json({
                success: false,
                error: 'Solo se pueden aprobar usuarios con rol de vendedor.',
                code: 'INVALID_USER_ROLE'
            });
        }
        if (userData.isApproved) {
            return res.status(400).json({
                success: false,
                error: 'El vendedor ya está aprobado.',
                code: 'SELLER_ALREADY_APPROVED'
            });
        }
        await userRef.update({
            isApproved: true,
            approvedAt: new Date().toISOString(),
            approvedBy: req.user.id,
            approvalReason: reason || 'Aprobado por administrador',
            updatedAt: new Date().toISOString()
        });
        // Enviar notificación por email
        await sendEmailNotification(userData.email, '¡Tu cuenta de vendedor ha sido aprobada!', `Hola ${userData.name},\n\nTu solicitud para convertirte en vendedor ha sido aprobada. Ya puedes comenzar a publicar productos en nuestra plataforma.\n\n¡Bienvenido a nuestra comunidad de artesanos!\n\nSaludos,\nEl equipo de Tesoros del Chocó`);
        res.status(200).json({
            success: true,
            message: 'Vendedor aprobado exitosamente.'
        });
    }
    catch (error) {
        console.error('Error en approveSeller:', error);
        res.status(500).json({
            success: false,
            error: 'Error al aprobar vendedor.',
            code: 'APPROVE_SELLER_ERROR'
        });
    }
};
exports.approveSeller = approveSeller;
const rejectSeller = async (req, res) => {
    const { id: userId } = req.params;
    const { reason } = req.body;
    try {
        const userRef = usersCollection.doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'El usuario no existe.',
                code: 'USER_NOT_FOUND'
            });
        }
        const userData = userDoc.data();
        if (userData.role !== 'vendedor') {
            return res.status(400).json({
                success: false,
                error: 'Solo se pueden rechazar usuarios con rol de vendedor.',
                code: 'INVALID_USER_ROLE'
            });
        }
        await userRef.update({
            isApproved: false,
            rejectedAt: new Date().toISOString(),
            rejectedBy: req.user.id,
            rejectionReason: reason || 'Rechazado por administrador',
            updatedAt: new Date().toISOString()
        });
        // Enviar notificación por email
        await sendEmailNotification(userData.email, 'Actualización sobre tu solicitud de vendedor', `Hola ${userData.name},\n\nLamentamos informarte que tu solicitud para convertirte en vendedor no ha sido aprobada en esta ocasión.\n\nRazón: ${reason || 'No especificada'}\n\nSi tienes preguntas, no dudes en contactarnos.\n\nSaludos,\nEl equipo de Tesoros del Chocó`);
        res.status(200).json({
            success: true,
            message: 'Solicitud de vendedor rechazada.'
        });
    }
    catch (error) {
        console.error('Error en rejectSeller:', error);
        res.status(500).json({
            success: false,
            error: 'Error al rechazar vendedor.',
            code: 'REJECT_SELLER_ERROR'
        });
    }
};
exports.rejectSeller = rejectSeller;
const suspendUser = async (req, res) => {
    const { id: userId } = req.params;
    const { reason } = req.body;
    try {
        const userRef = usersCollection.doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'El usuario no existe.',
                code: 'USER_NOT_FOUND'
            });
        }
        const userData = userDoc.data();
        await userRef.update({
            suspended: true,
            suspendedAt: new Date().toISOString(),
            suspendedBy: req.user.id,
            suspensionReason: reason || 'Suspendido por administrador',
            updatedAt: new Date().toISOString()
        });
        // Enviar notificación por email
        await sendEmailNotification(userData.email, 'Tu cuenta ha sido suspendida', `Hola ${userData.name},\n\nTu cuenta ha sido suspendida temporalmente.\n\nRazón: ${reason || 'No especificada'}\n\nSi tienes preguntas, contacta con soporte.\n\nSaludos,\nEl equipo de Tesoros del Chocó`);
        res.status(200).json({
            success: true,
            message: 'Usuario suspendido correctamente.'
        });
    }
    catch (error) {
        console.error('Error en suspendUser:', error);
        res.status(500).json({
            success: false,
            error: 'Error al suspender usuario.',
            code: 'SUSPEND_USER_ERROR'
        });
    }
};
exports.suspendUser = suspendUser;
const reactivateUser = async (req, res) => {
    const { id: userId } = req.params;
    const { reason } = req.body;
    try {
        const userRef = usersCollection.doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'El usuario no existe.',
                code: 'USER_NOT_FOUND'
            });
        }
        const userData = userDoc.data();
        await userRef.update({
            suspended: false,
            reactivatedAt: new Date().toISOString(),
            reactivatedBy: req.user.id,
            reactivationReason: reason || 'Reactivado por administrador',
            updatedAt: new Date().toISOString()
        });
        // Enviar notificación por email
        await sendEmailNotification(userData.email, 'Tu cuenta ha sido reactivada', `Hola ${userData.name},\n\nTu cuenta ha sido reactivada exitosamente.\n\nRazón: ${reason || 'Reactivación por administrador'}\n\n¡Bienvenido de vuelta!\n\nSaludos,\nEl equipo de Tesoros del Chocó`);
        res.status(200).json({
            success: true,
            message: 'Usuario reactivado correctamente.'
        });
    }
    catch (error) {
        console.error('Error en reactivateUser:', error);
        res.status(500).json({
            success: false,
            error: 'Error al reactivar usuario.',
            code: 'REACTIVATE_USER_ERROR'
        });
    }
};
exports.reactivateUser = reactivateUser;
// ===== ENDPOINTS DE MODERACIÓN DE PRODUCTOS =====
const getReportedProducts = async (req, res) => {
    try {
        const reportedProductsSnapshot = await productsCollection
            .where('isReported', '==', true)
            .orderBy('reportedAt', 'desc')
            .get();
        const reportedProducts = reportedProductsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json({ success: true, data: reportedProducts });
    }
    catch (error) {
        console.error('Error en getReportedProducts:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener productos reportados.',
            code: 'GET_REPORTED_PRODUCTS_ERROR'
        });
    }
};
exports.getReportedProducts = getReportedProducts;
const approveProduct = async (req, res) => {
    const { id: productId } = req.params;
    const { reason } = req.body;
    try {
        const productRef = productsCollection.doc(productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'El producto no existe.',
                code: 'PRODUCT_NOT_FOUND'
            });
        }
        const productData = productDoc.data();
        await productRef.update({
            isReported: false,
            isActive: true,
            approvedAt: new Date().toISOString(),
            approvedBy: req.user.id,
            approvalReason: reason || 'Aprobado por administrador',
            updatedAt: new Date().toISOString()
        });
        // Notificar al vendedor
        const sellerRef = usersCollection.doc(productData.sellerId);
        const sellerDoc = await sellerRef.get();
        if (sellerDoc.exists) {
            const sellerData = sellerDoc.data();
            await sendEmailNotification(sellerData.email, 'Tu producto ha sido aprobado', `Hola ${sellerData.name},\n\nTu producto "${productData.name}" ha sido aprobado y está ahora visible en la plataforma.\n\nSaludos,\nEl equipo de Tesoros del Chocó`);
        }
        res.status(200).json({
            success: true,
            message: 'Producto aprobado exitosamente.'
        });
    }
    catch (error) {
        console.error('Error en approveProduct:', error);
        res.status(500).json({
            success: false,
            error: 'Error al aprobar producto.',
            code: 'APPROVE_PRODUCT_ERROR'
        });
    }
};
exports.approveProduct = approveProduct;
const rejectProduct = async (req, res) => {
    const { id: productId } = req.params;
    const { reason } = req.body;
    try {
        const productRef = productsCollection.doc(productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'El producto no existe.',
                code: 'PRODUCT_NOT_FOUND'
            });
        }
        const productData = productDoc.data();
        await productRef.update({
            isReported: false,
            isActive: false,
            rejectedAt: new Date().toISOString(),
            rejectedBy: req.user.id,
            rejectionReason: reason || 'Rechazado por administrador',
            updatedAt: new Date().toISOString()
        });
        // Notificar al vendedor
        const sellerRef = usersCollection.doc(productData.sellerId);
        const sellerDoc = await sellerRef.get();
        if (sellerDoc.exists) {
            const sellerData = sellerDoc.data();
            await sendEmailNotification(sellerData.email, 'Tu producto ha sido rechazado', `Hola ${sellerData.name},\n\nTu producto "${productData.name}" ha sido rechazado y no está visible en la plataforma.\n\nRazón: ${reason || 'No especificada'}\n\nSaludos,\nEl equipo de Tesoros del Chocó`);
        }
        res.status(200).json({
            success: true,
            message: 'Producto rechazado exitosamente.'
        });
    }
    catch (error) {
        console.error('Error en rejectProduct:', error);
        res.status(500).json({
            success: false,
            error: 'Error al rechazar producto.',
            code: 'REJECT_PRODUCT_ERROR'
        });
    }
};
exports.rejectProduct = rejectProduct;
const suspendProduct = async (req, res) => {
    const { id: productId } = req.params;
    const { reason } = req.body;
    try {
        const productRef = productsCollection.doc(productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'El producto no existe.',
                code: 'PRODUCT_NOT_FOUND'
            });
        }
        const productData = productDoc.data();
        await productRef.update({
            isActive: false,
            suspendedAt: new Date().toISOString(),
            suspendedBy: req.user.id,
            suspensionReason: reason || 'Suspendido por administrador',
            updatedAt: new Date().toISOString()
        });
        // Notificar al vendedor
        const sellerRef = usersCollection.doc(productData.sellerId);
        const sellerDoc = await sellerRef.get();
        if (sellerDoc.exists) {
            const sellerData = sellerDoc.data();
            await sendEmailNotification(sellerData.email, 'Tu producto ha sido suspendido', `Hola ${sellerData.name},\n\nTu producto "${productData.name}" ha sido suspendido temporalmente.\n\nRazón: ${reason || 'No especificada'}\n\nSaludos,\nEl equipo de Tesoros del Chocó`);
        }
        res.status(200).json({
            success: true,
            message: 'Producto suspendido exitosamente.'
        });
    }
    catch (error) {
        console.error('Error en suspendProduct:', error);
        res.status(500).json({
            success: false,
            error: 'Error al suspender producto.',
            code: 'SUSPEND_PRODUCT_ERROR'
        });
    }
};
exports.suspendProduct = suspendProduct;
const getSystemStats = async (req, res) => {
    try {
        const [usersSnapshot, productsSnapshot, pendingSellersSnapshot, reportedProductsSnapshot] = await Promise.all([
            usersCollection.get(),
            productsCollection.get(),
            usersCollection.where('role', '==', 'vendedor').where('isApproved', '==', false).get(),
            productsCollection.where('isReported', '==', true).get()
        ]);
        const stats = {
            totalUsers: usersSnapshot.size,
            totalProducts: productsSnapshot.size,
            pendingSellers: pendingSellersSnapshot.size,
            reportedProducts: reportedProductsSnapshot.size,
            activeProducts: productsSnapshot.docs.filter(doc => doc.data().isActive).length,
            suspendedUsers: usersSnapshot.docs.filter(doc => doc.data().suspended).length
        };
        res.status(200).json({ success: true, data: stats });
    }
    catch (error) {
        console.error('Error en getSystemStats:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas del sistema.',
            code: 'GET_SYSTEM_STATS_ERROR'
        });
    }
};
exports.getSystemStats = getSystemStats;
//# sourceMappingURL=adminController.js.map