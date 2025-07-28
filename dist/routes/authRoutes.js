"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Simple, correct middleware usage
router.post('/verify-token', authMiddleware_1.authMiddleware, authController_1.verifyToken);
router.post('/refresh', authController_1.refreshToken);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map