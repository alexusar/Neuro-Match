import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes';
import friendRouter from './routes/friendRoutes';

dotenv.config();

const app = express();

// use port from .env file or if not the other one
const PORT = process.env.PORT || 6969;

app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5170',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//API ENDPOINTS
app.get('/', (req, res) => {res.send('API is live');
});

app.use('/api/auth', authRouter);
app.use('/api/friends', friendRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err.message);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});





//connecting to database through connection string
mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log('MongoDB connection error:', err));


