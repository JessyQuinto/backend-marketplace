import { Router } from 'express';
import {
  listUsers,
  approveSeller,
  rejectSeller,
  suspendUser,
  reactivateUser
} from '../controllers/adminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorizationMiddleware'; // Importar el nuevo middleware

const router = Router();

// Aplicar middleware de autenticación a todas las rutas de admin
router.use(authMiddleware);

// Aplicar middleware de autorización a todas las rutas de admin, solo 'admin' tiene acceso
router.use(authorize(['admin']));

router.get('/users', listUsers);
router.put('/users/:id/approve', approveSeller);
router.put('/users/:id/reject', rejectSeller);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/reactivate', reactivateUser);

export default router;
