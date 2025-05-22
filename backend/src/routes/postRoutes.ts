import express from 'express';
import { getMyPosts, createPost } from '../controllers/postController';
import { requireAuth } from '../middlewares/authMiddleware';
import { upload } from '../config/upload';

const router = express.Router();

// Fetch existing posts
router.get('/me', requireAuth, getMyPosts);

// Create a new post with a single `media` file
router.post(
    '/',
    requireAuth,
    upload.single('media'),
    createPost
);

export default router;