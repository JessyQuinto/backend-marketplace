import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { db } from '../config/firebase';
import { AddToCartDto } from '../validators/buyer.validator';
import { CartItem } from '../models/user';
import * as admin from 'firebase-admin';

const usersCollection = db.collection('users');
const productsCollection = db.collection('products');

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
    const buyerId = req.user.id;
    const { productId, quantity }: AddToCartDto = req.body;

    try {
        // 1. Verificar que el producto existe y tiene stock
        const productDoc = await productsCollection.doc(productId).get();
        if (!productDoc.exists) {
            return res.status(404).json({ success: false, error: 'El producto que intentas agregar no existe.', code: 'PRODUCT_NOT_FOUND' });
        }
        
        const product = productDoc.data();
        if (!product || product.stock < quantity) {
            return res.status(400).json({ success: false, error: 'Stock insuficiente para la cantidad solicitada.', code: 'INSUFFICIENT_STOCK' });
        }

        // 2. Añadir el producto al carrito del usuario
        const userRef = usersCollection.doc(buyerId);
        const newCartItem: CartItem = {
            productId,
            quantity,
            addedAt: new Date().toISOString()
        };

        // Usamos FieldValue.arrayUnion para añadir el item de forma segura.
        // NOTA: Esto no maneja la actualización de cantidad si el producto ya está en el carrito.
        // Una lógica más avanzada implicaría leer el carrito, actualizarlo y reescribirlo.
        await userRef.update({
            cart: admin.firestore.FieldValue.arrayUnion(newCartItem)
        });

        res.status(200).json({
            success: true,
            message: 'Producto agregado al carrito exitosamente.',
        });
    } catch (error) {
        console.error('Error en addToCart:', error);
        res.status(500).json({ success: false, error: 'Error al agregar el producto al carrito.', code: 'ADD_TO_CART_ERROR' });
    }
};

export const checkout = async (req: AuthenticatedRequest, res: Response) => {
    const buyerId = req.user.id;

    res.status(501).json({
        success: false,
        message: `La funcionalidad de checkout para el usuario ${buyerId} todavía no está implementada.`,
        code: 'NOT_IMPLEMENTED'
    });
};

export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
    const buyerId = req.user.id;
    
    res.status(501).json({
        success: false,
        message: `La obtención del historial de órdenes para el usuario ${buyerId} todavía no está implementada.`,
        code: 'NOT_IMPLEMENTED'
    });
};
