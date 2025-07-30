"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrder = exports.getOrders = exports.toggleProductStatus = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const firebase_1 = require("../config/firebase");
const productsCollection = firebase_1.db.collection('products');
const ordersCollection = firebase_1.db.collection('orders');
// ===== ENDPOINTS DE PRODUCTOS =====
const getProducts = async (req, res) => {
    const sellerId = req.user.id;
    try {
        const snapshot = await productsCollection.where('sellerId', '==', sellerId).get();
        if (snapshot.empty) {
            return res.status(200).json({ success: true, data: [] });
        }
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ success: true, data: products });
    }
    catch (error) {
        console.error('Error en getProducts:', error);
        res.status(500).json({ success: false, error: 'Error al obtener los productos.', code: 'GET_PRODUCTS_ERROR' });
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res) => {
    const sellerId = req.user.id;
    const { id: productId } = req.params;
    try {
        const productDoc = await productsCollection.doc(productId).get();
        if (!productDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado.',
                code: 'PRODUCT_NOT_FOUND'
            });
        }
        const product = { id: productDoc.id, ...productDoc.data() };
        if (product.sellerId !== sellerId) {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. No tienes permiso para ver este producto.',
                code: 'FORBIDDEN_PRODUCT_ACCESS'
            });
        }
        res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        console.error('Error en getProduct:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el producto.',
            code: 'GET_PRODUCT_ERROR'
        });
    }
};
exports.getProduct = getProduct;
const createProduct = async (req, res) => {
    const sellerId = req.user.id;
    const productData = req.body;
    // Validaciones adicionales
    if (productData.price <= 0) {
        return res.status(400).json({
            success: false,
            error: 'El precio debe ser mayor a 0.',
            code: 'INVALID_PRICE'
        });
    }
    if (productData.stock < 0) {
        return res.status(400).json({
            success: false,
            error: 'El stock no puede ser negativo.',
            code: 'INVALID_STOCK'
        });
    }
    const newProduct = {
        ...productData,
        sellerId,
        isActive: true, // Los productos se crean activos por defecto
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    try {
        const docRef = await productsCollection.add(newProduct);
        const createdProduct = { id: docRef.id, ...newProduct };
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente.',
            data: createdProduct
        });
    }
    catch (error) {
        console.error('Error en createProduct:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear el producto.',
            code: 'CREATE_PRODUCT_ERROR'
        });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    const sellerId = req.user.id;
    const { id: productId } = req.params;
    const productData = req.body;
    // Validaciones adicionales
    if (productData.price !== undefined && productData.price <= 0) {
        return res.status(400).json({
            success: false,
            error: 'El precio debe ser mayor a 0.',
            code: 'INVALID_PRICE'
        });
    }
    if (productData.stock !== undefined && productData.stock < 0) {
        return res.status(400).json({
            success: false,
            error: 'El stock no puede ser negativo.',
            code: 'INVALID_STOCK'
        });
    }
    try {
        const productRef = productsCollection.doc(productId);
        const doc = await productRef.get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado.',
                code: 'PRODUCT_NOT_FOUND'
            });
        }
        const product = doc.data();
        if (product.sellerId !== sellerId) {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. No tienes permiso para modificar este producto.',
                code: 'FORBIDDEN_PRODUCT_ACCESS'
            });
        }
        await productRef.update({
            ...productData,
            updatedAt: new Date().toISOString()
        });
        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente.'
        });
    }
    catch (error) {
        console.error('Error en updateProduct:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar el producto.',
            code: 'UPDATE_PRODUCT_ERROR'
        });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    const sellerId = req.user.id;
    const { id: productId } = req.params;
    try {
        const productRef = productsCollection.doc(productId);
        const doc = await productRef.get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado.',
                code: 'PRODUCT_NOT_FOUND'
            });
        }
        const product = doc.data();
        if (product.sellerId !== sellerId) {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. No tienes permiso para eliminar este producto.',
                code: 'FORBIDDEN_PRODUCT_ACCESS'
            });
        }
        // Verificar si el producto tiene órdenes pendientes
        const ordersSnapshot = await ordersCollection
            .where('items', 'array-contains-any', [{ productId }])
            .where('status', 'in', ['pending', 'processing'])
            .get();
        if (!ordersSnapshot.empty) {
            return res.status(400).json({
                success: false,
                error: 'No se puede eliminar el producto porque tiene órdenes pendientes.',
                code: 'PRODUCT_HAS_PENDING_ORDERS'
            });
        }
        await productRef.delete();
        res.status(200).json({
            success: true,
            message: 'Producto eliminado exitosamente.'
        });
    }
    catch (error) {
        console.error('Error en deleteProduct:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar el producto.',
            code: 'DELETE_PRODUCT_ERROR'
        });
    }
};
exports.deleteProduct = deleteProduct;
const toggleProductStatus = async (req, res) => {
    const sellerId = req.user.id;
    const { id: productId } = req.params;
    try {
        const productRef = productsCollection.doc(productId);
        const doc = await productRef.get();
        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado.',
                code: 'PRODUCT_NOT_FOUND'
            });
        }
        const product = doc.data();
        if (product.sellerId !== sellerId) {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. No tienes permiso para modificar este producto.',
                code: 'FORBIDDEN_PRODUCT_ACCESS'
            });
        }
        const newStatus = !product.isActive;
        await productRef.update({
            isActive: newStatus,
            updatedAt: new Date().toISOString()
        });
        res.status(200).json({
            success: true,
            message: `Producto ${newStatus ? 'activado' : 'desactivado'} exitosamente.`,
            data: { isActive: newStatus }
        });
    }
    catch (error) {
        console.error('Error en toggleProductStatus:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cambiar el estado del producto.',
            code: 'TOGGLE_PRODUCT_STATUS_ERROR'
        });
    }
};
exports.toggleProductStatus = toggleProductStatus;
// ===== ENDPOINTS DE ÓRDENES =====
const getOrders = async (req, res) => {
    const sellerId = req.user.id;
    try {
        // Obtener todas las órdenes que contengan productos del vendedor
        const snapshot = await ordersCollection
            .orderBy('createdAt', 'desc')
            .get();
        const sellerOrders = snapshot.docs.map(doc => {
            const order = { id: doc.id, ...doc.data() };
            // Filtrar solo los items que pertenecen a este vendedor
            order.items = order.items.filter(item => item.sellerId === sellerId);
            return order;
        }).filter(order => order.items.length > 0); // Solo órdenes con items del vendedor
        res.status(200).json({ success: true, data: sellerOrders });
    }
    catch (error) {
        console.error('Error en getOrders (seller):', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener las órdenes de tus productos.',
            code: 'GET_SELLER_ORDERS_ERROR'
        });
    }
};
exports.getOrders = getOrders;
const getOrder = async (req, res) => {
    const sellerId = req.user.id;
    const { id: orderId } = req.params;
    try {
        const orderDoc = await ordersCollection.doc(orderId).get();
        if (!orderDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Orden no encontrada.',
                code: 'ORDER_NOT_FOUND'
            });
        }
        const order = { id: orderDoc.id, ...orderDoc.data() };
        // Filtrar solo los items que pertenecen a este vendedor
        order.items = order.items.filter(item => item.sellerId === sellerId);
        if (order.items.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. Esta orden no contiene productos tuyos.',
                code: 'FORBIDDEN_ORDER_ACCESS'
            });
        }
        res.status(200).json({ success: true, data: order });
    }
    catch (error) {
        console.error('Error en getOrder:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener la orden.',
            code: 'GET_ORDER_ERROR'
        });
    }
};
exports.getOrder = getOrder;
const updateOrderStatus = async (req, res) => {
    const sellerId = req.user.id;
    const { id: orderId } = req.params;
    const { status, trackingNumber, notes } = req.body;
    // Validar estado permitido
    const allowedStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'Estado no válido.',
            code: 'INVALID_STATUS'
        });
    }
    try {
        const orderRef = ordersCollection.doc(orderId);
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Orden no encontrada.',
                code: 'ORDER_NOT_FOUND'
            });
        }
        const order = orderDoc.data();
        // Verificar que la orden contiene productos del vendedor
        const sellerItems = order.items.filter(item => item.sellerId === sellerId);
        if (sellerItems.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. Esta orden no contiene productos tuyos.',
                code: 'FORBIDDEN_ORDER_ACCESS'
            });
        }
        // Actualizar solo los items del vendedor
        const updatedItems = order.items.map(item => {
            if (item.sellerId === sellerId) {
                return {
                    ...item,
                    status,
                    trackingNumber: trackingNumber || item.trackingNumber,
                    updatedAt: new Date().toISOString()
                };
            }
            return item;
        });
        await orderRef.update({
            items: updatedItems,
            updatedAt: new Date().toISOString()
        });
        res.status(200).json({
            success: true,
            message: 'Estado de la orden actualizado exitosamente.'
        });
    }
    catch (error) {
        console.error('Error en updateOrderStatus:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar el estado de la orden.',
            code: 'UPDATE_ORDER_STATUS_ERROR'
        });
    }
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=sellerController.js.map