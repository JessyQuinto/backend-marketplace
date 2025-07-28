"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sellerController_1 = require("../controllers/sellerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorizationMiddleware_1 = require("../middlewares/authorizationMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const product_validator_1 = require("../validators/product.validator");
const router = (0, express_1.Router)();
// Middleware para todas las rutas de vendedor
router.use(authMiddleware_1.authMiddleware);
// Solo permite el rol 'seller' y requiere que la cuenta esté aprobada
router.use((0, authorizationMiddleware_1.authorize)(['seller'], { requireApproved: true }));
// --- Endpoints de Productos ---
// GET /api/seller/products - Obtiene todos los productos del vendedor
router.get('/products', sellerController_1.getProducts);
// POST /api/seller/products - Crea un nuevo producto (con validación)
router.post('/products', (0, validationMiddleware_1.validateBody)(product_validator_1.createProductSchema), sellerController_1.createProduct);
// PUT /api/seller/products/:id - Actualiza un producto existente (con validación)
router.put('/products/:id', (0, validationMiddleware_1.validateBody)(product_validator_1.updateProductSchema), sellerController_1.updateProduct);
// --- Endpoints de Órdenes ---
// GET /api/seller/orders - Obtiene las órdenes del vendedor
router.get('/orders', sellerController_1.getOrders);
exports.default = router;
//# sourceMappingURL=sellerRoutes.js.map