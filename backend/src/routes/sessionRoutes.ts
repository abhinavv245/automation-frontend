// src/routes/sessionRoutes.ts

import { Router } from 'express';
import { createSession, getSession, updateSession } from '../controllers/sessionController';

const router = Router();

// Define routes and use the correct async handler types
router.post('/create', createSession);

router.get('/get', getSession)

router.put('/update', updateSession)

export default router;
