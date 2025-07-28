import { Router } from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  getOrders
} from '../controllers/sellerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizationMiddleware } from '../middlewares/authorizationMiddleware';

const router = Router();

// Simple, correct middleware usage
router.use(authMiddleware);
router.use(authorizationMiddleware(['seller'], true));

router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.get('/orders', getOrders);

export default router;
