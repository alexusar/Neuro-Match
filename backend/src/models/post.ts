import mongoose from 'mongoose';

export interface IPost extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    createdAt: Date;
}

const postSchema = new mongoose.Schema<IPost>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IPost>('Post', postSchema);
