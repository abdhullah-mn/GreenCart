import express from 'express';
import {registerUser, login,isAuth,logout } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.router();

router.post('/register', registerUser);
router.post('/login', login);
router.get ('/is-Auth', authUser, isAuth);
router.get ('logout',authUser, userLogout);

export default userRouter;