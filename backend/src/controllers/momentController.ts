import { Response } from 'express';
import Moment from '../models/moment';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Types } from 'mongoose';

export const getAllMoments = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const moments = await Moment.find()
      .populate('userId', 'username avatar')
      .populate('comments.userId', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(moments);
  } catch (err) {
    console.error('Error fetching moments:', err);
    res.status(500).json({ message: 'Failed to fetch moments' });
  }
};

export const createMoment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { videoUrl, caption } = req.body;
    const userId = req.userId;
    
    // Provide default description if AI analysis isn't ready
    const description = req.body.description || null;

    const newMoment = new Moment({ videoUrl, caption, description, userId });
    await newMoment.save();

    // Fetch the moment again, populated
    const populatedMoment = await Moment.findById(newMoment._id)
      .populate('userId', 'username avatar')
      .populate('comments.userId', 'username avatar');

    res.status(201).json(populatedMoment);
  } catch (err) {
    console.error('Error creating moment:', err);
    res.status(400).json({ message: 'Failed to create moment' });
  }
};

export const likeMoment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const moment = await Moment.findById(req.params.id);
    if (!moment) return res.status(404).json({ message: 'Moment not found' });

    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'User ID required' });

    const likeIndex = moment.likes.findIndex(
      (id) => id.toString() === userId
    );

    if (likeIndex === -1) {
      moment.likes.push(new Types.ObjectId(userId));
    } else {
      moment.likes.splice(likeIndex, 1);
    }

    await moment.save();
    res.json(moment);
  } catch (err) {
    console.error('Error liking moment:', err);
    res.status(500).json({ message: 'Failed to like moment' });
  }
};

export const addComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text } = req.body;
    const userId = req.userId;
    const moment = await Moment.findById(req.params.id);
    
    if (!moment) return res.status(404).json({ message: 'Moment not found' });

    moment.comments.push({ text, userId });
    await moment.save();

    const updatedMoment = await Moment.findById(req.params.id)
      .populate('userId', 'username avatar')
      .populate('comments.userId', 'username avatar');

    res.json(updatedMoment);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
  const { momentId, commentId } = req.params;

  try {
    const moment = await Moment.findById(momentId);
    if (!moment) return res.status(404).json({ message: 'Moment not found' });

    const comment = moment.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    moment.comments.pull(commentId);
    await moment.save();

    const updatedMoment = await Moment.findById(momentId)
      .populate('userId', 'username avatar')
      .populate('comments.userId', 'username avatar');

    res.status(200).json(updatedMoment);
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};
