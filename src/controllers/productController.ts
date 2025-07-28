import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Product } from '../models/product';

const productsCollection = db.collection('products');

/**
 * Obtiene una lista de productos con filtros opcionales.
 * Esta ruta es pública y no requiere autenticación.
 */
export const listAllProducts = async (req: Request, res: Response) => {
    try {
        const { search, category } = req.query;
        
        const snapshot = await productsCollection.get();
        
        if (snapshot.empty) {
            return res.status(200).json({ success: true, data: [] });
        }

        let products: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        // Filtrar solo productos activos
        products = products.filter(p => p.isActive);
        
        // Aplicar filtros
        if (search) {
            const searchTerm = search.toString().toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm)
            );
        }
        
        if (category) {
            products = products.filter(p => p.category === category);
        }
        
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error('Error en listAllProducts:', error);
        res.status(500).json({ success: false, error: 'Error al obtener la lista de productos.', code: 'LIST_PRODUCTS_ERROR' });
    }
};

/**
 * Obtiene los detalles de un solo producto por su ID.
 * Esta ruta también es pública.
 */
export const getProductDetails = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const doc = await productsCollection.doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: 'Producto no encontrado.', code: 'PRODUCT_NOT_FOUND' });
        }

        const product: Product = { id: doc.id, ...doc.data() } as Product;

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error('Error en getProductDetails:', error);
        res.status(500).json({ success: false, error: 'Error al obtener los detalles del producto.', code: 'GET_PRODUCT_DETAILS_ERROR' });
    }
};
