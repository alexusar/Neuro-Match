import { Request, Response } from 'express';
import Post from '../models/post';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

// GET /api/posts/me
export const getMyPosts = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // req.userId is set by requireAuth()
        const posts = await Post.find({ userId: req.userId })
            .sort({ createdAt: -1 });
        // return as { posts: [...] } so front-end setPosts(res.data.posts)
        res.json({ success: true, posts });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ success: false, msg: 'Could not load posts' });
    }
};

export const createPost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, msg: 'No file uploaded' });
            return;
        }

        const mediaUrl = `/uploads/${req.file.filename}`;
        const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

        const newPost = await Post.create({
            userId: req.userId,
            mediaUrl,
            mediaType,
        });

        res.status(201).json({ success: true, post: newPost });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ success: false, msg: 'Could not create post' });
    }
};