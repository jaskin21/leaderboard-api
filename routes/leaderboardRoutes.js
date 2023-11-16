import express from 'express';
import { authAdmin, authUser } from '../middleware/authMiddleware.js';
import { addScore, leaderboard, viewLeaderboardEntries } from '../controller/leaderboardController.js';

const router = express.Router();

// Add board
router.post('/admin/leaderboard', authAdmin, leaderboard);

// add score
router.put('/leaderboard/:_id/user/:user_id/add_score', authUser, addScore);

// get leaderboard entries
router.get('/leaderboard/:_id', authUser, viewLeaderboardEntries);

export default router;
