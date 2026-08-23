import express from 'express';
import mongoose from 'mongoose';
import { updateCart } from '../controllers/cartController';
import authUser from '../middleware/authUser.js';

const cartRouter = express.Router();
cartRouter.post('/update', authUser, updateCart);

export default cartRouter;


