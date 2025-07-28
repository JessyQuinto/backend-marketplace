import { Router } from 'express';
import {
  listUsers,
  approveSeller,
  rejectSeller,
  suspendUser,
  reactivateUser
} from '../controllers/adminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizationMiddleware } from '../middlewares/authorizationMiddleware';

const router = Router();

// Simple, correct middleware usage
router.use(authMiddleware);
router.use(authorizationMiddleware(['admin']));

router.get('/users', listUsers);
router.put('/users/:id/approve', approveSeller);
router.put('/users/:id/reject', rejectSeller);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/reactivate', reactivateUser);

export default router;
