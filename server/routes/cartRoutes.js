import express from 'express';
import { updateCart, getCart } from '../controllers/cartController.js';
import authUser from '../middlewares/authUser.js';

const cartRouter = express.Router();
cartRouter.get('/', authUser, getCart);
cartRouter.post('/update', authUser, updateCart);

export default cartRouter;


