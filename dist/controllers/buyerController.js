"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = exports.checkout = exports.addToCart = void 0;
const firebase_1 = require("../config/firebase");
const checkDb = (res) => {
    if (!firebase_1.db) {
        res.status(503).json({ success: false, error: 'Servicio no disponible. La configuración de Firebase no está completa.', code: 'SERVICE_UNAVAILABLE' });
        return false;
    }
    return true;
};
const addToCart = async (req, res) => {
    if (!checkDb(res))
        return;
    // Placeholder for adding to cart
    res.status(200).json({ success: true, message: 'Producto agregado al carrito' });
};
exports.addToCart = addToCart;
const checkout = async (req, res) => {
    if (!checkDb(res))
        return;
    // Placeholder for checkout
    res.status(200).json({ success: true, message: 'Compra procesada' });
};
exports.checkout = checkout;
const getOrders = async (req, res) => {
    if (!checkDb(res))
        return;
    // Placeholder for getting orders
    res.status(200).json({ success: true, data: [] });
};
exports.getOrders = getOrders;
//# sourceMappingURL=buyerController.js.map