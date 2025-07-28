"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sellerController_1 = require("../controllers/sellerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorizationMiddleware_1 = require("../middlewares/authorizationMiddleware");
const router = (0, express_1.Router)();
// Simple, correct middleware usage
router.use(authMiddleware_1.authMiddleware);
router.use((0, authorizationMiddleware_1.authorizationMiddleware)(['seller'], true));
router.get('/products', sellerController_1.getProducts);
router.post('/products', sellerController_1.createProduct);
router.put('/products/:id', sellerController_1.updateProduct);
router.get('/orders', sellerController_1.getOrders);
exports.default = router;
//# sourceMappingURL=sellerRoutes.js.map