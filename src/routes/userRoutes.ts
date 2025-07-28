import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  registerSeller
} from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Simple, correct middleware usage
router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/register-seller', registerSeller);

export default router;
