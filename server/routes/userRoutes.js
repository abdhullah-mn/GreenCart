import express from 'express';
import { registerUser, login, isAuth, userlogout } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', login);
userRouter.get('/is-Auth', authUser, isAuth);
userRouter.get('/logout', authUser, userlogout);

export default userRouter;