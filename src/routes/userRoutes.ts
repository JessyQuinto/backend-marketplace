import { Router } from 'express';
import { getProfile, updateProfile, registerSeller } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { updateProfileSchema, registerSellerSchema } from '../validators/user.validator';

const router = Router();

// Todas las rutas aquí requieren autenticación
router.use(authMiddleware);

// GET /api/users/profile - No necesita validación de body
router.get('/profile', getProfile);

// PUT /api/users/profile - Valida el body ANTES de llegar al controlador
router.put('/profile', validateBody(updateProfileSchema), updateProfile);

// POST /api/users/register-seller - Valida el body ANTES de llegar al controlador
router.post('/register-seller', validateBody(registerSellerSchema), registerSeller);

export default router;
