import { Router } from 'express';
import {
  listUsers,
  getPendingSellers,
  approveSeller,
  rejectSeller,
  suspendUser,
  reactivateUser,
  getReportedProducts,
  approveProduct,
  rejectProduct,
  suspendProduct,
  getSystemStats
} from '../controllers/adminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorizationMiddleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Aplicar middleware de autorización - solo administradores
router.use(authorize(['admin']));

// ===== RUTAS DE GESTIÓN DE USUARIOS =====

// GET /api/admin/users - Listar todos los usuarios
router.get('/users', listUsers);

// GET /api/admin/pending-sellers - Obtener vendedores pendientes de aprobación
router.get('/pending-sellers', getPendingSellers);

// PUT /api/admin/sellers/:id/approve - Aprobar vendedor
router.put('/sellers/:id/approve', approveSeller);

// PUT /api/admin/sellers/:id/reject - Rechazar vendedor
router.put('/sellers/:id/reject', rejectSeller);

// PUT /api/admin/users/:id/suspend - Suspender usuario
router.put('/users/:id/suspend', suspendUser);

// PUT /api/admin/users/:id/reactivate - Reactivar usuario
router.put('/users/:id/reactivate', reactivateUser);

// ===== RUTAS DE MODERACIÓN DE PRODUCTOS =====

// GET /api/admin/reported-products - Obtener productos reportados
router.get('/reported-products', getReportedProducts);

// PUT /api/admin/products/:id/approve - Aprobar producto
router.put('/products/:id/approve', approveProduct);

// PUT /api/admin/products/:id/reject - Rechazar producto
router.put('/products/:id/reject', rejectProduct);

// PUT /api/admin/products/:id/suspend - Suspender producto
router.put('/products/:id/suspend', suspendProduct);

// ===== RUTAS DE ESTADÍSTICAS =====

// GET /api/admin/stats - Obtener estadísticas del sistema
router.get('/stats', getSystemStats);

export default router;
