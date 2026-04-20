import express from 'express';
import {registerUser, login, authUser} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);
router.post ('/is-Auth', authUser);

export default router;