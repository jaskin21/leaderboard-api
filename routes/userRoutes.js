import express from 'express';
import { addUser, viewUser } from '../controller/usercontroller.js';
import { authUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Add user
router.post('/', authUser, addUser);

// Get user
router.get('/:_id', authUser, viewUser);

export default router;
