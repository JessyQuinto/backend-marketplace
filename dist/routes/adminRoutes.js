"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorizationMiddleware_1 = require("../middlewares/authorizationMiddleware"); // Importar el nuevo middleware
const router = (0, express_1.Router)();
// Aplicar middleware de autenticación a todas las rutas de admin
router.use(authMiddleware_1.authMiddleware);
// Aplicar middleware de autorización a todas las rutas de admin, solo 'admin' tiene acceso
router.use((0, authorizationMiddleware_1.authorize)(['admin']));
router.get('/users', adminController_1.listUsers);
router.put('/users/:id/approve', adminController_1.approveSeller);
router.put('/users/:id/reject', adminController_1.rejectSeller);
router.put('/users/:id/suspend', adminController_1.suspendUser);
router.put('/users/:id/reactivate', adminController_1.reactivateUser);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map