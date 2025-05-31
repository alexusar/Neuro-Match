import express from 'express';
import mongoose from 'mongoose';
import { getMyPosts, createPost } from '../controllers/postController';
import { requireAuth } from '../middlewares/authMiddleware';
import { upload } from '../config/upload';

const router = express.Router();

/**
 * ── Public route: stream media from GridFS when the front-end requests "/api/posts/media/:fileId"
 *
 * We do NOT put any explicit `(req: Request<...>, res: Response<...>)` type annotations here,
 * because that can cause a mismatch with Express’s overloads (TS tries to match your function
 * to an `Application`‐type overload if the signature doesn’t exactly match `RequestHandler`).
 *
 * If you explicitly type the parameters in a way that doesn’t match `RequestHandler`, TS will
 * think you’re passing an `Application` instead of a route handler, hence the weird "missing `init`, `set`, etc." error.
 */
router.get('/media/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    const db = mongoose.connection.db!;

    // Validate that fileId is a valid ObjectId (24-hex string).
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      res.status(400).json({ success: false, msg: 'Invalid file ID' });
      return;
    }

    // Create a GridFSBucket on the existing connection
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads',
    });

    // Convert to ObjectId for querying
    const _id = new mongoose.Types.ObjectId(fileId);

    // Look up the file’s metadata in "uploads.files" to get the contentType
    const filesColl = db.collection('uploads.files');
    const fileDoc = await filesColl.findOne({ _id });

    if (!fileDoc) {
      res.status(404).json({ success: false, msg: 'File not found' });
      return;
    }

    // Set the Content-Type header to what was stored (e.g. "image/jpeg" or "video/mp4").
    res.set('Content-Type', fileDoc.contentType || 'application/octet-stream');

    // Stream the file from GridFS → to the HTTP response
    const downloadStream = bucket.openDownloadStream(_id);

    downloadStream.on('error', (err) => {
      console.error('GridFS download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, msg: 'Error streaming file' });
      }
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error('Error in GET /api/posts/media/:fileId', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, msg: 'Internal server error' });
    }
  }
});

// ─── Secured routes ───────────────────────────────────────────────────────────

// GET /api/posts/me
router.get('/me', requireAuth, getMyPosts);

// POST /api/posts (with a single "media" field, handled by Multer in memory)
router.post('/', requireAuth, upload.single('media'), createPost);

export default router;