import { Request, Response } from 'express';
import User from '../models/user';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Types } from 'mongoose';


// friend request functionality
export const sendFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    const { targetId } = req.body;
    const objectId = new Types.ObjectId(userId);

    if (!userId) {
        res.json({ success: false, msg: 'Not authenticated' });
        return;
    }

    if (userId === targetId) {
        res.json({ success: false, msg: "You can't friend yourself!" });
        return;
    }

    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(userId);

    if (!targetUser || !currentUser) {
        res.json({ success: false, message: 'User not found' });
        return;
    }

    if (targetUser.friendRequests.includes(objectId) || targetUser.friends.includes(objectId)) {
        res.json({ success: false, msg: "Already sent or already friends" });
        return;
    }

    targetUser.friendRequests.push(objectId);
    await targetUser.save();

    res.json({ success: true, msg: "Friend request sent" });

};



export const acceptFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    const { requesterId } = req.body;
    const objectId = new Types.ObjectId(userId);

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
        res.json({ success: false, msg: "User not found" });
        return;
    }

    if (!user.friendRequests.includes(requesterId)) {
        res.json({ success: false, msg: "No request found" });
        return;
    }

    user.friends.push(requesterId);
    requester.friends.push(objectId);

    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
    await user.save();
    await requester.save();

    res.json({ success: true, msg: "Friend request accepted" });
};



// friend search functionality
export const searchUsers = async (req: Request, res: Response) => {
    const { query } = req.query;

    try {
        if (!query || typeof query !== 'string') {
            res.json({ success: false, msg: "Missing search query" });
            return;
        }

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { firstname: { $regex: query, $options: 'i' } },
                { lastname: { $regex: query, $options: 'i' } },
            ]
        }).select('-password');

        res.json({ success: true, users });
    } catch (err) {
        console.error(err);
        res.json({ success: false, msg: "Server error" });
    }
};