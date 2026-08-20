import express from 'express';
import { getPlatformAnalytics, getAllAttempts, getAdminAttemptById } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/analytics', getPlatformAnalytics);
router.get('/attempts', getAllAttempts);
router.get('/attempts/:id', getAdminAttemptById);

export default router;
