import multer from 'multer';
import path from 'path';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

// Store files in the top-level uploads/ directory
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        // e.g. userId-timestamp-originalname.ext
        const authReq = req as AuthenticatedRequest;
        const unique = `${authReq.userId}-${Date.now()}-${file.originalname}`;
        cb(null, unique);
    },
});

export const upload = multer({ storage });