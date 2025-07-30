import { Router } from 'express';
import { verifyToken, refreshToken, register } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint para verificar token (requiere autenticación)
router.post('/verify-token', authMiddleware, verifyToken);

// Endpoint para registro (no requiere autenticación)
router.post('/register', register);

// Endpoint para refresh token (no requiere autenticación)
router.post('/refresh', refreshToken);

export default router;
