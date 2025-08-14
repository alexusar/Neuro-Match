// routes/user.ts
import express from 'express';
import { getUserById, getUserByUsername } from '../controllers/userController';

const router = express.Router();

// Get user by ID
router.get('/id/:id', getUserById);

// Get user by username
router.get('/username/:username', getUserByUsername);

export default router;
