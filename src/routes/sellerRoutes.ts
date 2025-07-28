import { Router } from 'express';
import { getProducts, createProduct, updateProduct, getOrders } from '../controllers/sellerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorizationMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();

// Middleware para todas las rutas de vendedor
router.use(authMiddleware);
// Solo permite el rol 'seller' y requiere que la cuenta esté aprobada
router.use(authorize(['seller'], { requireApproved: true }));

// --- Endpoints de Productos ---

// GET /api/seller/products - Obtiene todos los productos del vendedor
router.get('/products', getProducts);

// POST /api/seller/products - Crea un nuevo producto (con validación)
router.post('/products', validateBody(createProductSchema), createProduct);

// PUT /api/seller/products/:id - Actualiza un producto existente (con validación)
router.put('/products/:id', validateBody(updateProductSchema), updateProduct);


// --- Endpoints de Órdenes ---

// GET /api/seller/orders - Obtiene las órdenes del vendedor
router.get('/orders', getOrders);

export default router;
