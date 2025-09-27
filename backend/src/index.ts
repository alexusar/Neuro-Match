import express from 'express';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import http from 'http'; 
import { Server, Socket } from 'socket.io';
import authRouter from './routes/authRoutes';
import friendRouter from './routes/friendRoutes';
import messagesRouter from './routes/messageRoutes';
import momentRoutes from './routes/momentRoutes';
import userRoutes from './routes/userRoutes';

import chatRouter from './routes/chat';


import Message from './models/message';
import postRouter from './routes/postRoutes';

dotenv.config();

const app = express();

interface MessagePayload {
    senderId: string;
    recipientId: string;
    text: string;
    momentId?: string;
}

// use port from .env file or if not the other one
const PORT = process.env.PORT || 6969;

app.use(cookieParser());
app.use(cors({
    origin:[ 

    "https://neuro-match.com",
    "https://www.neuro-match.com",
    'http://localhost:5170',

  ],
    credentials: true,
}));

// allow large Base64 payloads (e.g. cropped images up to ~5 MB) 
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

//API ENDPOINTS
app.get('/', (req, res) => {res.send('API is live');
});

app.use('/api/auth', authRouter);
app.use('/api/friends', friendRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/posts', postRouter);
app.use('/api/moments', momentRoutes);
app.use('/api/users', userRoutes);

app.use('/api/chat', chatRouter);


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err.message);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Wrap with HTTP + Socket.IO ───────────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5170',
      'https://www.neuro-match.com'
    ],
    credentials: true
  }
});

// ─── Socket.IO Logic ──────────────────────────────────────────────────────────
io.on('connection', (socket: Socket) => {
    console.log('🟢 Socket connected:', socket.id);

    socket.on('join_room', (room: string) => {
        socket.join(room);
    });

    socket.on('send_message', async (msgData: MessagePayload) => {
        // Persist the message
        const saved = await Message.create(msgData);

        // Broadcast to the room of both users
        const room = [msgData.senderId, msgData.recipientId].sort().join('_');
        io.to(room).emit('receive_message', saved);
    });

    socket.on('disconnect', () => {
        console.log('🔴 Socket disconnected:', socket.id);
    });
});

// ─── Connect to Mongo AND Start Server ────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI!)
    .then(() => {
        console.log('✅ Connected to MongoDB');

        // Instead of app.listen(), now do:
        server.listen(PORT, () => {
            console.log(`🚀 Server (HTTP + Socket.IO) running on port ${PORT}`);
        });
    })
    .catch((err) => console.error('❌ MongoDB connection error:', err));


