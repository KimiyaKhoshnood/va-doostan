import { Router } from 'express';
import { login, refresh, register } from '../controllers/auth.controllers.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refresh);

export default router;