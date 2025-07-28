"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const buyerController_1 = require("../controllers/buyerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorizationMiddleware_1 = require("../middlewares/authorizationMiddleware"); // Importar el nuevo middleware
const router = (0, express_1.Router)();
// Middleware para todas las rutas de comprador
router.use(authMiddleware_1.authMiddleware);
// Solo permite el rol 'buyer'. No se necesita validación de aprobación aquí.
router.use((0, authorizationMiddleware_1.authorize)(['buyer']));
router.post('/cart/add', buyerController_1.addToCart);
router.post('/checkout', buyerController_1.checkout);
router.get('/orders', buyerController_1.getOrders);
exports.default = router;
//# sourceMappingURL=buyerRoutes.js.map