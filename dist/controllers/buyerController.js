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
exports.getOrders = exports.checkout = exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const firebase_1 = require("../config/firebase");
const admin = __importStar(require("firebase-admin"));
const usersCollection = firebase_1.db.collection('users');
const productsCollection = firebase_1.db.collection('products');
const ordersCollection = firebase_1.db.collection('orders');
// ===== ENDPOINTS DEL CARRITO =====
const getCart = async (req, res) => {
    const buyerId = req.user.id;
    try {
        const userDoc = await usersCollection.doc(buyerId).get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado.',
                code: 'USER_NOT_FOUND'
            });
        }
        const userData = userDoc.data();
        const cart = userData.cart || [];
        // Obtener información completa de los productos en el carrito
        const cartWithProducts = await Promise.all(cart.map(async (cartItem) => {
            try {
                const productDoc = await productsCollection.doc(cartItem.productId).get();
                if (productDoc.exists) {
                    const product = productDoc.data();
                    return {
                        ...cartItem,
                        product: {
                            id: productDoc.id,
                            name: product.name,
                            price: product.price,
                            images: product.images,
                            sellerName: product.sellerName,
                            maxStock: product.stock
                        }
                    };
                }
                return null; // Producto no encontrado
            }
            catch (error) {
                console.error('Error obteniendo producto:', error);
                return null;
            }
        }));
        // Filtrar productos válidos
        const validCartItems = cartWithProducts.filter(item => item !== null);
        res.status(200).json({
            success: true,
            data: validCartItems
        });
    }
    catch (error) {
        console.error('Error en getCart:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el carrito.',
            code: 'GET_CART_ERROR'
        });
    }
};
exports.getCart = getCart;
const addToCart = async (req, res) => {
    const buyerId = req.user.id;
    const { productId, quantity } = req.body;
    try {
        // Verificar que el producto existe y está activo
        const productDoc = await productsCollection.doc(productId).get();
        if (!productDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'El producto que intentas agregar no existe.',
                code: 'PRODUCT_NOT_FOUND'
            });
        }
        const product = productDoc.data();
        if (!product.isActive) {
            return res.status(400).json({
                success: false,
                error: 'El producto no está disponible para la venta.',
                code: 'PRODUCT_INACTIVE'
            });
        }
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                error: 'Stock insuficiente para la cantidad solicitada.',
                code: 'INSUFFICIENT_STOCK'
            });
        }
        // Obtener carrito actual del usuario
        const userRef = usersCollection.doc(buyerId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado.',
                code: 'USER_NOT_FOUND'
            });
        }
        const userData = userDoc.data();
        const currentCart = userData.cart || [];
        // Verificar si el producto ya está en el carrito
        const existingItemIndex = currentCart.findIndex(item => item.productId === productId);
        if (existingItemIndex !== -1) {
            // Actualizar cantidad del producto existente
            const newQuantity = currentCart[existingItemIndex].quantity + quantity;
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    error: 'La cantidad total excede el stock disponible.',
                    code: 'QUANTITY_EXCEEDS_STOCK'
                });
            }
            currentCart[existingItemIndex].quantity = newQuantity;
        }
        else {
            // Agregar nuevo producto al carrito
            const newCartItem = {
                productId,
                quantity,
                addedAt: new Date().toISOString()
            };
            currentCart.push(newCartItem);
        }
        // Actualizar carrito en la base de datos
        await userRef.update({ cart: currentCart });
        res.status(200).json({
            success: true,
            message: 'Producto agregado al carrito exitosamente.',
            data: { cartItemCount: currentCart.length }
        });
    }
    catch (error) {
        console.error('Error en addToCart:', error);
        res.status(500).json({
            success: false,
            error: 'Error al agregar producto al carrito.',
            code: 'ADD_TO_CART_ERROR'
        });
    }
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res) => {
    const buyerId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity < 0) {
        return res.status(400).json({
            success: false,
            error: 'La cantidad debe ser mayor a 0.',
            code: 'INVALID_QUANTITY'
        });
    }
    try {
        // Verificar stock del producto
        const productDoc = await productsCollection.doc(productId).get();
        if (!productDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado.',
                code: 'PRODUCT_NOT_FOUND'
            });
        }
        const product = productDoc.data();
        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                error: 'La cantidad excede el stock disponible.',
                code: 'QUANTITY_EXCEEDS_STOCK'
            });
        }
        // Actualizar carrito
        const userRef = usersCollection.doc(buyerId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado.',
                code: 'USER_NOT_FOUND'
            });
        }
        const userData = userDoc.data();
        const currentCart = userData.cart || [];
        const itemIndex = currentCart.findIndex(item => item.productId === productId);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado en el carrito.',
                code: 'CART_ITEM_NOT_FOUND'
            });
        }
        if (quantity === 0) {
            // Eliminar producto del carrito
            currentCart.splice(itemIndex, 1);
        }
        else {
            // Actualizar cantidad
            currentCart[itemIndex].quantity = quantity;
        }
        await userRef.update({ cart: currentCart });
        res.status(200).json({
            success: true,
            message: quantity === 0 ? 'Producto eliminado del carrito.' : 'Cantidad actualizada exitosamente.',
            data: { cartItemCount: currentCart.length }
        });
    }
    catch (error) {
        console.error('Error en updateCartItem:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar el carrito.',
            code: 'UPDATE_CART_ERROR'
        });
    }
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (req, res) => {
    const buyerId = req.user.id;
    const { productId } = req.params;
    try {
        const userRef = usersCollection.doc(buyerId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado.',
                code: 'USER_NOT_FOUND'
            });
        }
        const userData = userDoc.data();
        const currentCart = userData.cart || [];
        const filteredCart = currentCart.filter(item => item.productId !== productId);
        await userRef.update({ cart: filteredCart });
        res.status(200).json({
            success: true,
            message: 'Producto eliminado del carrito exitosamente.',
            data: { cartItemCount: filteredCart.length }
        });
    }
    catch (error) {
        console.error('Error en removeFromCart:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar producto del carrito.',
            code: 'REMOVE_FROM_CART_ERROR'
        });
    }
};
exports.removeFromCart = removeFromCart;
const clearCart = async (req, res) => {
    const buyerId = req.user.id;
    try {
        const userRef = usersCollection.doc(buyerId);
        await userRef.update({ cart: [] });
        res.status(200).json({
            success: true,
            message: 'Carrito vaciado exitosamente.'
        });
    }
    catch (error) {
        console.error('Error en clearCart:', error);
        res.status(500).json({
            success: false,
            error: 'Error al vaciar el carrito.',
            code: 'CLEAR_CART_ERROR'
        });
    }
};
exports.clearCart = clearCart;
// ===== ENDPOINTS EXISTENTES =====
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