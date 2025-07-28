"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Simple, correct middleware usage
router.use(authMiddleware_1.authMiddleware);
router.get('/profile', userController_1.getProfile);
router.put('/profile', userController_1.updateProfile);
router.post('/register-seller', userController_1.registerSeller);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map