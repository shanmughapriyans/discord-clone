import { Router } from 'express';
import { createServer, getUserServers, getServerDetails, joinServer } from '../controllers/serverController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createServer);
router.post('/:id/join', authMiddleware, joinServer);
router.get('/', authMiddleware, getUserServers);
router.get('/:id', authMiddleware, getServerDetails);

export default router;
