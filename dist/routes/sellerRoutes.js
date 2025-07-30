"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sellerController_1 = require("../controllers/sellerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorizationMiddleware_1 = require("../middlewares/authorizationMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const product_validator_1 = require("../validators/product.validator");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware_1.authMiddleware);
// Aplicar middleware de autorización - solo vendedores aprobados
router.use((0, authorizationMiddleware_1.authorize)(['vendedor'], { requireApproved: true }));
// ===== RUTAS DE PRODUCTOS =====
// GET /api/seller/products - Listar productos del vendedor
router.get('/products', sellerController_1.getProducts);
// GET /api/seller/products/:id - Obtener producto específico del vendedor
router.get('/products/:id', sellerController_1.getProduct);
// POST /api/seller/products - Crear nuevo producto
router.post('/products', (0, validationMiddleware_1.validateBody)(product_validator_1.createProductSchema), sellerController_1.createProduct);
// PUT /api/seller/products/:id - Actualizar producto existente
router.put('/products/:id', (0, validationMiddleware_1.validateBody)(product_validator_1.updateProductSchema), sellerController_1.updateProduct);
// DELETE /api/seller/products/:id - Eliminar producto
router.delete('/products/:id', sellerController_1.deleteProduct);
// PUT /api/seller/products/:id/toggle - Activar/desactivar producto
router.put('/products/:id/toggle', sellerController_1.toggleProductStatus);
// ===== RUTAS DE ÓRDENES =====
// GET /api/seller/orders - Listar órdenes del vendedor
router.get('/orders', sellerController_1.getOrders);
// GET /api/seller/orders/:id - Obtener orden específica del vendedor
router.get('/orders/:id', sellerController_1.getOrder);
// PUT /api/seller/orders/:id/status - Actualizar estado de orden
router.put('/orders/:id/status', sellerController_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=sellerRoutes.js.map