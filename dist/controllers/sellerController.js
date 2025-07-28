"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const firebase_1 = require("../config/firebase");
const checkDb = (res) => {
    if (!firebase_1.db) {
        res.status(503).json({ success: false, error: 'Servicio no disponible. La configuración de Firebase no está completa.', code: 'SERVICE_UNAVAILABLE' });
        return false;
    }
    return true;
};
const getProducts = async (req, res) => {
    if (!checkDb(res))
        return;
    // Placeholder for getting products
    res.status(200).json({ success: true, data: [] });
};
exports.getProducts = getProducts;
const createProduct = async (req, res) => {
    if (!checkDb(res))
        return;
    // Placeholder for creating a product
    res.status(201).json({ success: true, message: 'Producto creado' });
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    if (!checkDb(res))
        return;
    // Placeholder for updating a product
    res.status(200).json({ success: true, message: 'Producto actualizado' });
};
exports.updateProduct = updateProduct;
const getOrders = async (req, res) => {
    if (!checkDb(res))
        return;
    // Placeholder for getting orders
    res.status(200).json({ success: true, data: [] });
};
exports.getOrders = getOrders;
//# sourceMappingURL=sellerController.js.map