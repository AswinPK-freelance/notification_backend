import express from 'express';
const router = express.Router();

import { registerUser, getUsers, loginUser } from '../controller/auth.controller.js';

router.post('/register', registerUser);
router.get('/users', getUsers);
router.post('/login', loginUser);

export default router;
