import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user'; // adjust path as needed

// Extend Express Request to include our auth fields
export interface AuthenticatedRequest extends Request {
  userId?: string;
  currentUser?: any; // Optionally replace `any` with your User document interface
}

// Middleware to require authentication and attach currentUser
export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Extract JWT from cookies
  const token = req.cookies.token;
  if (!token) {
      res.status(401).json({ success: false, msg: 'Not authenticated' });
      return;
  }

  try {
    // Verify token and extract payload
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = decoded.id;

    // Fetch the user from the database
    const user = await User.findById(decoded.id);
    if (!user) {
        res.status(401).json({ success: false, msg: 'User not found' }); 
        return;
    }
    // Attach the full user document for downstream access
    req.currentUser = user;

    // Proceed to next handler
    next();
  } catch (err) {
    console.error('Auth error:', err);
      res.status(401).json({ success: false, msg: 'Invalid or expired token' });
      return;
  }
};
