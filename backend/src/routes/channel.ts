import { Router } from 'express';
import { createChannel, getChannelMessages } from '../controllers/channelController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createChannel);
router.get('/:id/messages', authMiddleware, getChannelMessages);

export default router;
