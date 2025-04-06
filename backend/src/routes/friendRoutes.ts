import express from 'express';
import { sendFriendRequest, acceptFriendRequest, searchUsers } from '../controllers/friendController';
import { requireAuth } from '../middlewares/authMiddleware';

const friendRouter = express.Router();

friendRouter.post('/send-request', requireAuth, sendFriendRequest);
friendRouter.post('/accept-request', requireAuth, acceptFriendRequest);
friendRouter.get('/search', requireAuth, searchUsers);

export default friendRouter;
