import express from 'express';
import { sellerLogin, isAuth, sellerLogout } from '../controllers/sellerController.js';
import authSeller from '../middlewares/authSeller.js';

const sellerRouter = express.router();

router.post('/login',sellerLogin);
router.get('/is-Auth',authSeller, isAuth );
router.get('/logout',sellerLogout );

export default sellerRouter;

