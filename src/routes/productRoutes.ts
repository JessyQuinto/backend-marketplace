import { Router } from 'express';
import { listAllProducts, getProductDetails } from '../controllers/productController';

const router = Router();

// Estas rutas son públicas y no requieren autenticación.
// Cualquiera puede ver el catálogo de productos.

// GET /api/products - Listar todos los productos
router.get('/', listAllProducts);

// GET /api/products/:id - Ver detalles de un solo producto
router.get('/:id', getProductDetails);

export default router;
