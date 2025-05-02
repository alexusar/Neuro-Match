import express from 'express';
import { register, login, logout, getCurrentUser, verifyEmail } from '../controllers/authController';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', getCurrentUser);
authRouter.get('/verify/:token', verifyEmail);

export default authRouter;
