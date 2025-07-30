"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorizationMiddleware_1 = require("../middlewares/authorizationMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware_1.authMiddleware);
// Aplicar middleware de autorización - solo administradores
router.use((0, authorizationMiddleware_1.authorize)(['admin']));
// ===== RUTAS DE GESTIÓN DE USUARIOS =====
// GET /api/admin/users - Listar todos los usuarios
router.get('/users', adminController_1.listUsers);
// GET /api/admin/pending-sellers - Obtener vendedores pendientes de aprobación
router.get('/pending-sellers', adminController_1.getPendingSellers);
// PUT /api/admin/sellers/:id/approve - Aprobar vendedor
router.put('/sellers/:id/approve', adminController_1.approveSeller);
// PUT /api/admin/sellers/:id/reject - Rechazar vendedor
router.put('/sellers/:id/reject', adminController_1.rejectSeller);
// PUT /api/admin/users/:id/suspend - Suspender usuario
router.put('/users/:id/suspend', adminController_1.suspendUser);
// PUT /api/admin/users/:id/reactivate - Reactivar usuario
router.put('/users/:id/reactivate', adminController_1.reactivateUser);
// ===== RUTAS DE MODERACIÓN DE PRODUCTOS =====
// GET /api/admin/reported-products - Obtener productos reportados
router.get('/reported-products', adminController_1.getReportedProducts);
// PUT /api/admin/products/:id/approve - Aprobar producto
router.put('/products/:id/approve', adminController_1.approveProduct);
// PUT /api/admin/products/:id/reject - Rechazar producto
router.put('/products/:id/reject', adminController_1.rejectProduct);
// PUT /api/admin/products/:id/suspend - Suspender producto
router.put('/products/:id/suspend', adminController_1.suspendProduct);
// ===== RUTAS DE ESTADÍSTICAS =====
// GET /api/admin/stats - Obtener estadísticas del sistema
router.get('/stats', adminController_1.getSystemStats);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map