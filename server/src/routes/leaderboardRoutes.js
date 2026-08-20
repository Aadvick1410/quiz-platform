import express from 'express';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getLeaderboard);

export default router;
