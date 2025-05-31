import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Post from '../models/post';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

/**
 * GET /api/posts/me
 * Returns all posts belonging to the authenticated user.
 */
export const getMyPosts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const posts = await Post.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ success: false, msg: 'Could not load posts' });
  }
};

/**
 * POST /api/posts
 * (multipart/form-data w/ a single “media” field)
 *
 * We assume `upload.single('media')` has already run, so:
 *   - `req.file.buffer` is a Buffer of the uploaded image/video.
 *   - `req.file.mimetype` is the MIME type (e.g. "image/png", "video/mp4").
 *   - `req.userId` is populated by our `requireAuth` middleware.
 *
 * We write the file into GridFS, then store `/api/posts/media/<fileId>` in the Post document.
 */
export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, msg: 'No file uploaded' });
      return;
    }

    // Determine image vs. video (so front-end knows how to render)
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

    const db = mongoose.connection.db!;

    // 2) Open (or create) a GridFSBucket named "uploads"
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads',
    });

    // 3) Give the file a name in GridFS (this is just metadata; not the URL)
    const filenameOnGridFS = `${req.userId}-${Date.now()}-${req.file.originalname}`;

    // 4) Open a writable stream to GridFS
    const uploadStream = bucket.openUploadStream(filenameOnGridFS, {
      contentType: req.file.mimetype,
    });

    // 5) Write the entire buffer into GridFS, then close the stream
    uploadStream.end(req.file.buffer);

    // 6) When the stream finishes, uploadStream.id contains the new file's ObjectId
    uploadStream.on('finish', async () => {
      try {
        // ✔ Instead of reading fileDoc._id, use uploadStream.id:
        const fileId = uploadStream.id as mongoose.Types.ObjectId;

        // Build the URL that your front-end will fetch
        const mediaUrl = `/api/posts/media/${fileId}`;

        // 7) Create the Post document in MongoDB
        const newPost = await Post.create({
          userId: req.userId,
          mediaUrl,
          mediaType,
        });

        return res.status(201).json({ success: true, post: newPost });
      } catch (errInner) {
        console.error('Error creating Post after GridFS upload:', errInner);
        res
          .status(500)
          .json({ success: false, msg: 'Could not create post after uploading media' });
        return;
      }
    });

    // 8) Handle any GridFS write errors
    uploadStream.on('error', (errStream) => {
      console.error('Error uploading to GridFS:', errStream);
      if (!res.headersSent) {
        res
          .status(500)
          .json({ success: false, msg: 'Error saving media to database' });
        return;
      }
    });
  } catch (outerErr) {
    console.error('Unexpected error in createPost:', outerErr);
    res.status(500).json({ success: false, msg: 'Could not create post' });
    return;
  }
};