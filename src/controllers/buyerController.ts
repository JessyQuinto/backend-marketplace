import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { db } from '../config/firebase';
import { AddToCartDto, CheckoutDto } from '../validators/buyer.validator';
import { CartItem, UserProfile } from '../models/user';
import { Product } from '../models/product';
import { Order, OrderItem } from '../models/order';
import * as admin from 'firebase-admin';

const usersCollection = db.collection('users');
const productsCollection = db.collection('products');
const ordersCollection = db.collection('orders');

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
    const buyerId = req.user.id;
    const { productId, quantity }: AddToCartDto = req.body;

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
        const newCartItem: CartItem = {
            productId,
            quantity,
            addedAt: new Date().toISOString()
        };
        
        // Esta lógica simple añade al carrito. Para actualizar cantidades se necesitaría una transacción.
        await userRef.update({
            cart: admin.firestore.FieldValue.arrayUnion(newCartItem)
        });

        res.status(200).json({ success: true, message: 'Producto agregado al carrito exitosamente.' });
    } catch (error) {
        console.error('Error en addToCart:', error);
        res.status(500).json({ success: false, error: 'Error al agregar el producto al carrito.', code: 'ADD_TO_CART_ERROR' });
    }
};

export const checkout = async (req: AuthenticatedRequest, res: Response) => {
    const buyer = req.user as UserProfile;
    const { shippingAddress }: CheckoutDto = req.body;

    if (!buyer.cart || buyer.cart.length === 0) {
        return res.status(400).json({ success: false, error: 'Tu carrito está vacío.', code: 'EMPTY_CART' });
    }

    try {
        const orderId = await db.runTransaction(async (transaction) => {
            const productRefs = buyer.cart.map(item => productsCollection.doc(item.productId));
            const productDocs = await transaction.getAll(...productRefs);
            const itemsToOrder: OrderItem[] = [];
            let totalPrice = 0;

            for (let i = 0; i < productDocs.length; i++) {
                const productDoc = productDocs[i];
                const cartItem = buyer.cart[i];
                if (!productDoc.exists) throw new Error(`El producto con ID ${cartItem.productId} ya no existe.`);
                const product = productDoc.data() as Product;
                if (product.stock < cartItem.quantity) throw new Error(`Stock insuficiente para: ${product.name}.`);
                
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
    } catch (error) {
        console.error('Error en checkout:', error);
        res.status(500).json({ success: false, error: error.message || 'Error al procesar la compra.', code: 'CHECKOUT_ERROR' });
    }
};

export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
    const buyerId = req.user.id;
    try {
        const snapshot = await ordersCollection.where('buyerId', '==', buyerId).orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            return res.status(200).json({ success: true, data: [] });
        }
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error('Error en getOrders (buyer):', error);
        res.status(500).json({ success: false, error: 'Error al obtener tu historial de órdenes.', code: 'GET_BUYER_ORDERS_ERROR' });
    }
};
