"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const firebase_1 = require("../config/firebase");
const productsCollection = firebase_1.db.collection('products');
const ordersCollection = firebase_1.db.collection('orders');
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
const createProduct = async (req, res) => {
    const sellerId = req.user.id;
    const productData = req.body;
    const newProduct = {
        ...productData,
        sellerId,
        isActive: true, // Los productos se crean activos por defecto
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    try {
        const docRef = await productsCollection.add(newProduct);
        res.status(201).json({ success: true, message: 'Producto creado exitosamente.', data: { id: docRef.id, ...newProduct } });
    }
    catch (error) {
        console.error('Error en createProduct:', error);
        res.status(500).json({ success: false, error: 'Error al crear el producto.', code: 'CREATE_PRODUCT_ERROR' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    const sellerId = req.user.id;
    const { id: productId } = req.params;
    const productData = req.body;
    try {
        const productRef = productsCollection.doc(productId);
        const doc = await productRef.get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Producto no encontrado.', code: 'PRODUCT_NOT_FOUND' });
        }
        const product = doc.data();
        if (product.sellerId !== sellerId) {
            return res.status(403).json({ success: false, error: 'Acceso denegado. No tienes permiso para modificar este producto.', code: 'FORBIDDEN_PRODUCT_ACCESS' });
        }
        await productRef.update({ ...productData, updatedAt: new Date().toISOString() });
        res.status(200).json({ success: true, message: 'Producto actualizado exitosamente.' });
    }
    catch (error) {
        console.error('Error en updateProduct:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar el producto.', code: 'UPDATE_PRODUCT_ERROR' });
    }
};
exports.updateProduct = updateProduct;
const getOrders = async (req, res) => {
    const sellerId = req.user.id;
    try {
        // Esta consulta busca en todas las órdenes aquellos documentos que contengan al menos un item
        // cuyo sellerId coincida con el del vendedor autenticado.
        const snapshot = await ordersCollection.where('items', 'array-contains-any', [{ sellerId }]).get();
        // Firestore no puede filtrar el sub-array en el servidor, por lo que lo hacemos en el cliente.
        // Esto es una limitación conocida. La consulta anterior es un pre-filtrado.
        const sellerOrders = snapshot.docs.map(doc => {
            const order = { id: doc.id, ...doc.data() };
            // Filtramos los items para devolver solo los que pertenecen a este vendedor.
            order.items = order.items.filter(item => item.sellerId === sellerId);
            return order;
        }).filter(order => order.items.length > 0); // Nos aseguramos de no devolver órdenes vacías.
        res.status(200).json({ success: true, data: sellerOrders });
    }
    catch (error) {
        console.error('Error en getOrders (seller):', error);
        res.status(500).json({ success: false, error: 'Error al obtener las órdenes de tus productos.', code: 'GET_SELLER_ORDERS_ERROR' });
    }
};
exports.getOrders = getOrders;
//# sourceMappingURL=sellerController.js.map