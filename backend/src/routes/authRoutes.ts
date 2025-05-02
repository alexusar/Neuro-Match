import express from 'express';
import { register, login, logout, verifyEmail } from '../controllers/authController';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/verify/:token', verifyEmail);

export default authRouter;
