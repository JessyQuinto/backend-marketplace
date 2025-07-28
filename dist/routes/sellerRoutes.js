"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sellerController_1 = require("../controllers/sellerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorizationMiddleware_1 = require("../middlewares/authorizationMiddleware"); // Importar el nuevo middleware
const router = (0, express_1.Router)();
// Middleware para todas las rutas de vendedor
router.use(authMiddleware_1.authMiddleware);
// Solo permite el rol 'seller' y requiere que la cuenta esté aprobada
router.use((0, authorizationMiddleware_1.authorize)(['seller'], { requireApproved: true }));
// Endpoints para vendedores
router.get('/products', sellerController_1.getProducts);
router.post('/products', sellerController_1.createProduct);
router.put('/products/:id', sellerController_1.updateProduct);
router.get('/orders', sellerController_1.getOrders);
exports.default = router;
//# sourceMappingURL=sellerRoutes.js.map