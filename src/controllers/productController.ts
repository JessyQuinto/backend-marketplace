import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Product } from '../models/product';

// Datos de prueba en memoria para desarrollo
const sampleProducts: Product[] = [
    {
        id: '1',
        name: 'Chocolate Premium',
        description: 'Delicioso chocolate artesanal con 70% cacao',
        price: 25.99,
        stock: 100,
        category: 'Chocolates',
        images: ['https://example.com/chocolate1.jpg'],
        sellerId: 'seller1',
        sellerName: 'Chocolatería Artesanal',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Bombones Surtidos',
        description: 'Caja de bombones con diferentes sabores',
        price: 35.50,
        stock: 50,
        category: 'Chocolates',
        images: ['https://example.com/bombones1.jpg'],
        sellerId: 'seller1',
        sellerName: 'Chocolatería Artesanal',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Trufas de Chocolate Negro',
        description: 'Trufas cremosas de chocolate negro',
        price: 18.75,
        stock: 30,
        category: 'Chocolates',
        images: ['https://example.com/trufas1.jpg'],
        sellerId: 'seller2',
        sellerName: 'Dulces Tradicionales',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

const productsCollection = db.collection('products');

/**
 * Obtiene una lista de productos con filtros opcionales.
 * Esta ruta es pública y no requiere autenticación.
 */
export const listAllProducts = async (req: Request, res: Response) => {
    try {
        const { search, category } = req.query;
        
        // Usar datos de prueba si Firestore no está disponible
        let products: Product[] = [];
        
        try {
            const snapshot = await productsCollection.get();
            if (!snapshot.empty) {
                products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            }
        } catch (firestoreError) {
            console.log('Firebase no disponible, usando datos de prueba...');
            products = [...sampleProducts];
        }
        
        // Si no hay productos en Firestore, usar datos de prueba
        if (products.length === 0) {
            products = [...sampleProducts];
        }
        
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
        let product: Product | null = null;
        
        try {
            const doc = await productsCollection.doc(id).get();
            if (doc.exists) {
                product = { id: doc.id, ...doc.data() } as Product;
            }
        } catch (firestoreError) {
            console.log('Firebase no disponible, buscando en datos de prueba...');
        }
        
        // Si no se encontró en Firestore, buscar en datos de prueba
        if (!product) {
            product = sampleProducts.find(p => p.id === id) || null;
        }

        if (!product) {
            return res.status(404).json({ success: false, error: 'Producto no encontrado.', code: 'PRODUCT_NOT_FOUND' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error('Error en getProductDetails:', error);
        res.status(500).json({ success: false, error: 'Error al obtener los detalles del producto.', code: 'GET_PRODUCT_DETAILS_ERROR' });
    }
};
