import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes';

dotenv.config();

const app = express();

// use port from .env file or if not the other one
const PORT = process.env.PORT || 6969;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//API ENDPOINTS
app.get('/', (req, res) => {res.send('API is live');
});

app.use('/api', authRouter);





//connecting to database through connection string
mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log('MongoDB connection error:', err));


