"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const user_validator_1 = require("../validators/user.validator");
const router = (0, express_1.Router)();
// Todas las rutas aquí requieren autenticación
router.use(authMiddleware_1.authMiddleware);
// GET /api/users/profile - No necesita validación de body
router.get('/profile', userController_1.getProfile);
// PUT /api/users/profile - Valida el body ANTES de llegar al controlador
router.put('/profile', (0, validationMiddleware_1.validateBody)(user_validator_1.updateProfileSchema), userController_1.updateProfile);
// POST /api/users/register-seller - Valida el body ANTES de llegar al controlador
router.post('/register-seller', (0, validationMiddleware_1.validateBody)(user_validator_1.registerSellerSchema), userController_1.registerSeller);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map