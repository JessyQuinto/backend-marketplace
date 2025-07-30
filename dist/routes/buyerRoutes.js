"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const buyerController_1 = require("../controllers/buyerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorizationMiddleware_1 = require("../middlewares/authorizationMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const buyer_validator_1 = require("../validators/buyer.validator");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware_1.authMiddleware);
// Aplicar middleware de autorización - solo compradores
router.use((0, authorizationMiddleware_1.authorize)(['buyer']));
// ===== RUTAS DEL CARRITO =====
// GET /api/buyer/cart - Obtener carrito del usuario
router.get('/cart', buyerController_1.getCart);
// POST /api/buyer/cart/add - Agregar producto al carrito
router.post('/cart/add', (0, validationMiddleware_1.validateBody)(buyer_validator_1.addToCartSchema), buyerController_1.addToCart);
// PUT /api/buyer/cart/:productId - Actualizar cantidad de producto en carrito
router.put('/cart/:productId', buyerController_1.updateCartItem);
// DELETE /api/buyer/cart/:productId - Eliminar producto del carrito
router.delete('/cart/:productId', buyerController_1.removeFromCart);
// DELETE /api/buyer/cart - Vaciar carrito completo
router.delete('/cart', buyerController_1.clearCart);
// ===== RUTAS DE COMPRA =====
// POST /api/buyer/checkout - Procesar la compra (con validación)
router.post('/checkout', (0, validationMiddleware_1.validateBody)(buyer_validator_1.checkoutSchema), buyerController_1.checkout);
// GET /api/buyer/orders - Obtener historial de órdenes del comprador
router.get('/orders', buyerController_1.getOrders);
exports.default = router;
//# sourceMappingURL=buyerRoutes.js.map