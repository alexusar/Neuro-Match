import express from 'express';
import { getAllMoments, createMoment, likeMoment, addComment, deleteComment } from '../controllers/momentController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getAllMoments as express.RequestHandler);
router.post('/', requireAuth, createMoment as express.RequestHandler);
router.post('/:id/like', requireAuth, likeMoment as express.RequestHandler);
router.post('/:id/comment', requireAuth, addComment as express.RequestHandler);
router.delete('/:momentId/comment/:commentId', requireAuth, deleteComment as express.RequestHandler);



export default router;
