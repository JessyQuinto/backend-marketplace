"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const buyerController_1 = require("../controllers/buyerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorizationMiddleware_1 = require("../middlewares/authorizationMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const buyer_validator_1 = require("../validators/buyer.validator");
const router = (0, express_1.Router)();
// Middleware para todas las rutas de comprador
router.use(authMiddleware_1.authMiddleware);
// Solo permite el rol 'buyer'.
router.use((0, authorizationMiddleware_1.authorize)(['buyer']));
// POST /api/buyer/cart/add - Añadir al carrito (con validación)
router.post('/cart/add', (0, validationMiddleware_1.validateBody)(buyer_validator_1.addToCartSchema), buyerController_1.addToCart);
// POST /api/buyer/checkout - Procesar la compra (con validación)
router.post('/checkout', (0, validationMiddleware_1.validateBody)(buyer_validator_1.checkoutSchema), buyerController_1.checkout);
router.get('/orders', buyerController_1.getOrders);
exports.default = router;
//# sourceMappingURL=buyerRoutes.js.map