import express from 'express';
import { sellerLogin, isAuth, sellerLogout, registerSeller } from '../controllers/sellerController.js';
import authSeller from '../middlewares/authSeller.js';

const sellerRouter = express.Router();

sellerRouter.post('/register', registerSeller);
sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/is-Auth', authSeller, isAuth);
sellerRouter.get('/logout', sellerLogout);

export default sellerRouter;

