import { Router } from 'express';
import { verifyToken, refreshToken } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Simple, correct middleware usage
router.post('/verify-token', authMiddleware, verifyToken);
router.post('/refresh', refreshToken);

export default router;
