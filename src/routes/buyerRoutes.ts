import { Router } from 'express';
import {
  addToCart,
  checkout,
  getOrders
} from '../controllers/buyerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizationMiddleware } from '../middlewares/authorizationMiddleware';

const router = Router();

// Simple, correct middleware usage
router.use(authMiddleware);
router.use(authorizationMiddleware(['buyer']));

router.post('/cart/add', addToCart);
router.post('/checkout', checkout);
router.get('/orders', getOrders);

export default router;
