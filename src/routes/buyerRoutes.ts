import { Router } from 'express';
import {
  addToCart,
  checkout,
  getOrders
} from '../controllers/buyerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorizationMiddleware'; // Importar el nuevo middleware

const router = Router();

// Middleware para todas las rutas de comprador
router.use(authMiddleware);
// Solo permite el rol 'buyer'. No se necesita validación de aprobación aquí.
router.use(authorize(['buyer']));

router.post('/cart/add', addToCart);
router.post('/checkout', checkout);
router.get('/orders', getOrders);

export default router;
