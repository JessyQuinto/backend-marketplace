import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { db } from '../config/firebase';
import { CreateProductDto, UpdateProductDto } from '../validators/product.validator';
import { Product } from '../models/product';
import { Order } from '../models/order';

const productsCollection = db.collection('products');
const ordersCollection = db.collection('orders');

// ===== ENDPOINTS DE PRODUCTOS =====

export const getProducts = async (req: AuthenticatedRequest, res: Response) => {
    const sellerId = req.user.id;
    try {
        const snapshot = await productsCollection.where('sellerId', '==', sellerId).get();
        if (snapshot.empty) {
            return res.status(200).json({ success: true, data: [] });
        }
        const products: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error('Error en getProducts:', error);
        res.status(500).json({ success: false, error: 'Error al obtener los productos.', code: 'GET_PRODUCTS_ERROR' });
    }
};

export const getProduct = async (req: AuthenticatedRequest, res: Response) => {
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

        const product = { id: productDoc.id, ...productDoc.data() } as Product;
        
        if (product.sellerId !== sellerId) {
            return res.status(403).json({ 
                success: false, 
                error: 'Acceso denegado. No tienes permiso para ver este producto.', 
                code: 'FORBIDDEN_PRODUCT_ACCESS' 
            });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error('Error en getProduct:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener el producto.', 
            code: 'GET_PRODUCT_ERROR' 
        });
    }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
    const sellerId = req.user.id;
    const productData: CreateProductDto = req.body;
    
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

    const newProduct: Omit<Product, 'id'> = {
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
    } catch (error) {
        console.error('Error en createProduct:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear el producto.', 
            code: 'CREATE_PRODUCT_ERROR' 
        });
    }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
    const sellerId = req.user.id;
    const { id: productId } = req.params;
    const productData: UpdateProductDto = req.body;
    
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
        
        const product = doc.data() as Product;
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
    } catch (error) {
        console.error('Error en updateProduct:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar el producto.', 
            code: 'UPDATE_PRODUCT_ERROR' 
        });
    }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
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
        
        const product = doc.data() as Product;
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
    } catch (error) {
        console.error('Error en deleteProduct:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al eliminar el producto.', 
            code: 'DELETE_PRODUCT_ERROR' 
        });
    }
};

export const toggleProductStatus = async (req: AuthenticatedRequest, res: Response) => {
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
        
        const product = doc.data() as Product;
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
    } catch (error) {
        console.error('Error en toggleProductStatus:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al cambiar el estado del producto.', 
            code: 'TOGGLE_PRODUCT_STATUS_ERROR' 
        });
    }
};

// ===== ENDPOINTS DE ÓRDENES =====

export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
    const sellerId = req.user.id;
    try {
        // Obtener todas las órdenes que contengan productos del vendedor
        const snapshot = await ordersCollection
            .orderBy('createdAt', 'desc')
            .get();

        const sellerOrders = snapshot.docs.map(doc => {
            const order = { id: doc.id, ...doc.data() } as Order;
            // Filtrar solo los items que pertenecen a este vendedor
            order.items = order.items.filter(item => item.sellerId === sellerId);
            return order;
        }).filter(order => order.items.length > 0); // Solo órdenes con items del vendedor

        res.status(200).json({ success: true, data: sellerOrders });
    } catch (error) {
        console.error('Error en getOrders (seller):', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener las órdenes de tus productos.', 
            code: 'GET_SELLER_ORDERS_ERROR' 
        });
    }
};

export const getOrder = async (req: AuthenticatedRequest, res: Response) => {
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
        
        const order = { id: orderDoc.id, ...orderDoc.data() } as Order;
        
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
    } catch (error) {
        console.error('Error en getOrder:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener la orden.', 
            code: 'GET_ORDER_ERROR' 
        });
    }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
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
        
        const order = orderDoc.data() as Order;
        
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
    } catch (error) {
        console.error('Error en updateOrderStatus:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar el estado de la orden.', 
            code: 'UPDATE_ORDER_STATUS_ERROR' 
        });
    }
};
