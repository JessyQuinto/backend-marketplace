"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = exports.checkout = exports.addToCart = void 0;
const firebase_1 = require("../config/firebase");
const admin = __importStar(require("firebase-admin"));
const usersCollection = firebase_1.db.collection('users');
const productsCollection = firebase_1.db.collection('products');
const ordersCollection = firebase_1.db.collection('orders');
const addToCart = async (req, res) => {
    const buyerId = req.user.id;
    const { productId, quantity } = req.body;
    try {
        const productDoc = await productsCollection.doc(productId).get();
        if (!productDoc.exists) {
            return res.status(404).json({ success: false, error: 'El producto que intentas agregar no existe.', code: 'PRODUCT_NOT_FOUND' });
        }
        const product = productDoc.data();
        if (!product || product.stock < quantity) {
            return res.status(400).json({ success: false, error: 'Stock insuficiente para la cantidad solicitada.', code: 'INSUFFICIENT_STOCK' });
        }
        const userRef = usersCollection.doc(buyerId);
        const newCartItem = {
            productId,
            quantity,
            addedAt: new Date().toISOString()
        };
        // Esta lógica simple añade al carrito. Para actualizar cantidades se necesitaría una transacción.
        await userRef.update({
            cart: admin.firestore.FieldValue.arrayUnion(newCartItem)
        });
        res.status(200).json({ success: true, message: 'Producto agregado al carrito exitosamente.' });
    }
    catch (error) {
        console.error('Error en addToCart:', error);
        res.status(500).json({ success: false, error: 'Error al agregar el producto al carrito.', code: 'ADD_TO_CART_ERROR' });
    }
};
exports.addToCart = addToCart;
const checkout = async (req, res) => {
    const buyer = req.user;
    const { shippingAddress } = req.body;
    if (!buyer.cart || buyer.cart.length === 0) {
        return res.status(400).json({ success: false, error: 'Tu carrito está vacío.', code: 'EMPTY_CART' });
    }
    try {
        const orderId = await firebase_1.db.runTransaction(async (transaction) => {
            const productRefs = buyer.cart.map(item => productsCollection.doc(item.productId));
            const productDocs = await transaction.getAll(...productRefs);
            const itemsToOrder = [];
            let totalPrice = 0;
            for (let i = 0; i < productDocs.length; i++) {
                const productDoc = productDocs[i];
                const cartItem = buyer.cart[i];
                if (!productDoc.exists)
                    throw new Error(`El producto con ID ${cartItem.productId} ya no existe.`);
                const product = productDoc.data();
                if (product.stock < cartItem.quantity)
                    throw new Error(`Stock insuficiente para: ${product.name}.`);
                transaction.update(productRefs[i], { stock: admin.firestore.FieldValue.increment(-cartItem.quantity) });
                itemsToOrder.push({
                    productId: cartItem.productId,
                    sellerId: product.sellerId,
                    name: product.name,
                    price: product.price,
                    quantity: cartItem.quantity,
                    image: product.images[0] || '',
                });
                totalPrice += product.price * cartItem.quantity;
            }
            const orderRef = ordersCollection.doc();
            transaction.set(orderRef, {
                buyerId: buyer.id,
                items: itemsToOrder,
                totalPrice,
                status: 'pending',
                shippingAddress,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            const userRef = usersCollection.doc(buyer.id);
            transaction.update(userRef, { cart: [] });
            return orderRef.id;
        });
        res.status(201).json({ success: true, message: '¡Compra realizada exitosamente!', data: { orderId } });
    }
    catch (error) {
        console.error('Error en checkout:', error);
        res.status(500).json({ success: false, error: error.message || 'Error al procesar la compra.', code: 'CHECKOUT_ERROR' });
    }
};
exports.checkout = checkout;
const getOrders = async (req, res) => {
    const buyerId = req.user.id;
    try {
        const snapshot = await ordersCollection.where('buyerId', '==', buyerId).orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            return res.status(200).json({ success: true, data: [] });
        }
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ success: true, data: orders });
    }
    catch (error) {
        console.error('Error en getOrders (buyer):', error);
        res.status(500).json({ success: false, error: 'Error al obtener tu historial de órdenes.', code: 'GET_BUYER_ORDERS_ERROR' });
    }
};
exports.getOrders = getOrders;
//# sourceMappingURL=buyerController.js.map