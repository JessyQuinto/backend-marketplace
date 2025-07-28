import { Router } from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  getOrders
} from '../controllers/sellerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorizationMiddleware'; // Importar el nuevo middleware

const router = Router();

// Middleware para todas las rutas de vendedor
router.use(authMiddleware);
// Solo permite el rol 'seller' y requiere que la cuenta esté aprobada
router.use(authorize(['seller'], { requireApproved: true }));

// Endpoints para vendedores
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.get('/orders', getOrders);

export default router;
