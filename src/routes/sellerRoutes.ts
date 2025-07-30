import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getOrders,
  getOrder,
  updateOrderStatus
} from '../controllers/sellerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorizationMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Aplicar middleware de autorización - solo vendedores aprobados
router.use(authorize(['seller'], { requireApproved: true }));

// ===== RUTAS DE PRODUCTOS =====

// GET /api/seller/products - Listar productos del vendedor
router.get('/products', getProducts);

// GET /api/seller/products/:id - Obtener producto específico del vendedor
router.get('/products/:id', getProduct);

// POST /api/seller/products - Crear nuevo producto
router.post('/products', validateBody(createProductSchema), createProduct);

// PUT /api/seller/products/:id - Actualizar producto existente
router.put('/products/:id', validateBody(updateProductSchema), updateProduct);

// DELETE /api/seller/products/:id - Eliminar producto
router.delete('/products/:id', deleteProduct);

// PUT /api/seller/products/:id/toggle - Activar/desactivar producto
router.put('/products/:id/toggle', toggleProductStatus);

// ===== RUTAS DE ÓRDENES =====

// GET /api/seller/orders - Listar órdenes del vendedor
router.get('/orders', getOrders);

// GET /api/seller/orders/:id - Obtener orden específica del vendedor
router.get('/orders/:id', getOrder);

// PUT /api/seller/orders/:id/status - Actualizar estado de orden
router.put('/orders/:id/status', updateOrderStatus);

export default router;
