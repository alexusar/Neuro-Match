// routes/messages.ts
import express, { Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middlewares/authMiddleware';
import Message from '../models/message';

const router = express.Router();

// GET /api/messages?with=<otherUserId>
router.get(
    '/',
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
        const meId = req.currentUser!._id;
        const otherId = req.query.with as string;

        const convo = await Message.find({
            $or: [
                { senderId: meId, recipientId: otherId },
                { senderId: otherId, recipientId: meId }
            ]
        })
            .sort({ createdAt: 1 });

        res.json(convo);
    }
);

// POST /api/messages
router.post(
    '/',
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
        const meId = req.currentUser!._id;
        const { recipientId, text, momentId } = req.body;

        const msg = await Message.create({
            senderId: meId,
            recipientId,
            text,
            momentId
        });

        res.status(201).json(msg);
    }
);

export default router;
