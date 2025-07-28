import { Router } from 'express';
import { addToCart, checkout, getOrders } from '../controllers/buyerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorizationMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { addToCartSchema, checkoutSchema } from '../validators/buyer.validator';

const router = Router();

// Middleware para todas las rutas de comprador
router.use(authMiddleware);
// Solo permite el rol 'buyer'.
router.use(authorize(['buyer']));

// POST /api/buyer/cart/add - Añadir al carrito (con validación)
router.post('/cart/add', validateBody(addToCartSchema), addToCart);

// POST /api/buyer/checkout - Procesar la compra (con validación)
router.post('/checkout', validateBody(checkoutSchema), checkout);

router.get('/orders', getOrders);

export default router;
