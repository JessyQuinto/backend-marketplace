import { Router } from 'express';
import { 
  addToCart, 
  checkout, 
  getOrders,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/buyerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorizationMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { addToCartSchema, checkoutSchema } from '../validators/buyer.validator';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Aplicar middleware de autorización - solo compradores
router.use(authorize(['comprador']));

// ===== RUTAS DEL CARRITO =====

// GET /api/buyer/cart - Obtener carrito del usuario
router.get('/cart', getCart);

// POST /api/buyer/cart/add - Agregar producto al carrito
router.post('/cart/add', validateBody(addToCartSchema), addToCart);

// PUT /api/buyer/cart/:productId - Actualizar cantidad de producto en carrito
router.put('/cart/:productId', updateCartItem);

// DELETE /api/buyer/cart/:productId - Eliminar producto del carrito
router.delete('/cart/:productId', removeFromCart);

// DELETE /api/buyer/cart - Vaciar carrito completo
router.delete('/cart', clearCart);

// ===== RUTAS DE COMPRA =====

// POST /api/buyer/checkout - Procesar la compra (con validación)
router.post('/checkout', validateBody(checkoutSchema), checkout);

// GET /api/buyer/orders - Obtener historial de órdenes del comprador
router.get('/orders', getOrders);

export default router;
