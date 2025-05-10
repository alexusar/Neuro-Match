import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/sendVerificationEmail';

// Type for the request with user data
interface AuthRequest extends Request {
    userId?: string;
    currentUser?: any;
}

// async allows other request to be handled, handling the async request in background
// await pauses code untill the promise is resolved









//register functionality 
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, firstname, lastname, email, password } = req.body;

    // Validate required fields
    if (!username || !firstname || !lastname || !email || !password) {
        res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
        return;
    }

    try {
        //if user alr exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            res.json({ success: false, message: 'User already exists' });
            return;
        }

        //hash password, 10 bc the hash function is ran 10 rounds
        const hashedPassword = await bcrypt.hash(password, 10);

        //created hashed verifcation token
        const verificationToken = crypto.randomBytes(32).toString('hex');


        //for storing the new hashed password
        const user = new User({
            username,
            firstname,
            lastname,
            email,
            password: hashedPassword,
            verificationToken,
            isVerified: false,
          });

        //saving it to database
        await user.save();
        await sendVerificationEmail(email, verificationToken);


        //created token, mongoose automatically creates a id feild to any documented created
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

        // Set JWT as an HTTP-only cookie so the client stays logged in.
        // This cookie is:
        // - httpOnly: cannot be accessed via JavaScript (protects against XSS)
        // - secure: only sent over HTTPS in production
        // - sameSite: controls cross-site behavior (set to 'none' for cross-origin use in production)
        // - maxAge: cookie lasts for 7 days
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //reistration was completed correctly
        res.json({ success: true, message: 'User registered. Verification email sent.' });




    } catch (error: any) {
        next(error);
    }
}










//login functionality 
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, password } = req.body;

    if(!username || !password) {
        res.json({success: false, message: 'username and password required'});
        return;
    }

    try {
        const user = await User.findOne({username});
        
        if (!user) {
            res.json({success: false, message: 'invalid username'});
            return;
        }

        // Move verification check before password check
        if (!user.isVerified) {
            res.status(403).json({ 
                success: false, 
                message: 'Please verify your email before logging in.',
                requiresVerification: true
            });
            return;
        }

        const isSame = await bcrypt.compare(password, user.password);

        if(!isSame) {
            res.json({success: false, message: "invalid password"});
            return;
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({success: true});

    } catch (error: any) {
        next(error);
    }
}



//logout functionality
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 
            'none' : 'strict',
        })

        res.json({succes: true, message: "Logged Out"})
        

    } catch (error: any) {
        next(error);
    }

}

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.params;
        
        // Find user with matching verification token
        const user = await User.findOne({ verificationToken: token });
        
        if (!user) {
            res.status(400).json({ 
                success: false, 
                message: 'Invalid verification token' 
            });
            return;
        }

        // Update user verification status
        user.isVerified = true;
        user.verificationToken = ''; // Clear the verification token
        await user.save();

        // Return success response
        res.status(200).json({ 
            success: true, 
            message: 'Email verified successfully' 
        });

    } catch (error: any) {
        console.error('Email verification error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to verify email' 
        });
    }
};




export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.token;
    if (!token) {
        res.json({ success: false, msg: 'Not authenticated' });
        return;
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const user = await User.findById(decoded.id)
            .select('-password')
            .populate('friendRequests', 'username firstname lastname')
            .populate('friends', 'username firstname lastname');

        if (!user) {
            res.json({ success: false, msg: 'User not found' });
            return;
        }

        res.json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.json({ success: false, msg: 'Invalid token' });
    }
};
