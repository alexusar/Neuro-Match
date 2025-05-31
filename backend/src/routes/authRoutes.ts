import express from 'express';
import mongoose from 'mongoose';
import { register, login, logout, getCurrentUser, verifyEmail, updateProfile } from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';

const authRouter = express.Router();

// Route handlers
authRouter.post('/register', (req, res, next) => register(req, res, next));
authRouter.post('/login', (req, res, next) => login(req, res, next));
authRouter.post('/logout', (req, res, next) => logout(req, res, next));
authRouter.get('/me', (req, res) => getCurrentUser(req, res));
authRouter.get('/verify/:token', (req, res, next) => verifyEmail(req, res, next));
authRouter.put('/me', requireAuth, updateProfile);

authRouter.get('/media/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    // Validate that fileId is a 24-hex string
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      res.status(400).json({ success: false, msg: 'Invalid file ID' });
      return;
    }

    // Grab the native Db object, then open the "uploads" bucket (same bucketName used above)
    const db = mongoose.connection.db!;
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads',
    });

    // Look up the file’s metadata to set the correct Content-Type
    const filesColl = db.collection('uploads.files');
    const _id = new mongoose.Types.ObjectId(fileId);
    const fileDoc = await filesColl.findOne({ _id });
    if (!fileDoc) {
      res.status(404).json({ success: false, msg: 'File not found' });
      return;
    }

    res.set('Content-Type', fileDoc.contentType || 'application/octet-stream');
    // Optional: set caching headers
    // res.set('Cache-Control', 'public, max-age=31536000');

    // Pipe the file from GridFS to the response
    const downloadStream = bucket.openDownloadStream(_id);
    downloadStream.on('error', (err) => {
      console.error('GridFS download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, msg: 'Error streaming file' });
      }
    });
    downloadStream.pipe(res);
  } catch (err) {
    console.error('Error in GET /api/users/media/:fileId', err);
    res.status(500).json({ success: false, msg: 'Internal server error' });
  }
});

export default authRouter;
