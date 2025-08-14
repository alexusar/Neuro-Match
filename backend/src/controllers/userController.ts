// controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/user';

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const getUserByUsername = async (req: Request, res: Response): Promise<void> => {
  console.log("username param:", req.params.username);

  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};
