import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
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

        res.json({ 
            success: true, 
            user: {
              _id: user._id,
              username: user.username,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              //avatar: user.avatar || null // optional, if you store it
            }
          });
          

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



export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1) Grab the logged-in user’s ID (in your auth middleware, you probably set `req.currentUser`)
    const userId = req.currentUser!._id;

    // 2) Pull out just the fields you want to allow changing:
    const { age, pronouns, bio, profilePicture, gender, height, preferences } = req.body;

    // 3) Build an "updates" object; TS knows these fields exist now:
    const updates: any = { age, pronouns, bio, gender, height, preferences };

    /**
     * 4) If profilePicture is a base64 Data-URL, decode and save to GridFS instead of disk.
     *    GridFS will store the file in the “uploads.files” & “uploads.chunks” collections.
     *    We will then store `/api/users/media/<fileId>` in the user record.
     */
    if (typeof profilePicture === 'string' && profilePicture.startsWith('data:')) {
      // Extract MIME type (e.g. "image/png" or "image/jpeg") and the actual Base64 data
      const matches = profilePicture.match(/^data:(.+)\/(.+);base64,(.+)$/);
      if (matches) {
        const mimeMain = matches[1];  // e.g. "image"
        const mimeSub = matches[2];   // e.g. "png" or "jpeg"
        const base64Data = matches[3];
        const buffer = Buffer.from(base64Data, 'base64');

        // Create a GridFSBucket (bucketName "uploads" to match your posts)
        const db = mongoose.connection.db!;
        const bucket = new mongoose.mongo.GridFSBucket(db, {
          bucketName: 'uploads',            // You can also choose "profilePics" but reusing "uploads" is fine
        });

        // Give the stored file a filename (purely metadata; not the URL)
        const filenameOnGridFS = `${userId}-${Date.now()}.${mimeSub}`;
        const uploadStream = bucket.openUploadStream(filenameOnGridFS, {
          contentType: `${mimeMain}/${mimeSub}`,  // e.g. "image/png"
        });

        // Write buffer into GridFS, then close the stream
        uploadStream.end(buffer);

        // Once “finish” fires, uploadStream.id is the new ObjectId of the stored file
        await new Promise<void>((resolve, reject) => {
          uploadStream.on('finish', () => {
            resolve();
          });
          uploadStream.on('error', (err) => {
            console.error('GridFS error saving profile picture:', err);
            reject(err);
          });
        });

        // Retrieve the new file’s ObjectId
        const fileId = uploadStream.id as mongoose.Types.ObjectId;

        // Build a URL that your front-end will use to fetch/stream that image:
        // We will create a route GET /api/users/media/:fileId below, so:
        updates.profilePicture = `/api/auth/media/:fileId`;
      }
    }
    // 5) Otherwise, if they already passed a URL string (e.g. they pasted a link),
    //    just store it exactly so the front-end can show it
    else if (typeof profilePicture === 'string') {
      updates.profilePicture = profilePicture;
    }

    // 6) Now update the User in one shot, and return the updated user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
};