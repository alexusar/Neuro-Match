import express from 'express';
import { register, login, logout, getCurrentUser, verifyEmail } from '../controllers/authController';

const authRouter = express.Router();

// Route handlers
authRouter.post('/register', (req, res, next) => register(req, res, next));
authRouter.post('/login', (req, res, next) => login(req, res, next));
authRouter.post('/logout', (req, res, next) => logout(req, res, next));
authRouter.get('/me', (req, res) => getCurrentUser(req, res));
authRouter.get('/verify/:token', (req, res, next) => verifyEmail(req, res, next));

export default authRouter;
