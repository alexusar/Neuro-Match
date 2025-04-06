import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
        res.json({ success: false, msg: 'Not authenticated' });
        return;
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        req.userId = decoded.id;
        next();
    } catch (err) {
        console.error(err);
        res.json({ success: false, msg: 'Invalid token' });
        return;
    }
};
