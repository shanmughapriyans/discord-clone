import { Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';

export const createChannel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serverId, name } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const membership = await prisma.serverMembership.findUnique({
      where: { userId_serverId: { userId, serverId } }
    });

    if (!membership) {
      res.status(403).json({ error: 'Not a member of this server' });
      return;
    }

    const channel = await prisma.channel.create({
      data: { name, serverId }
    });

    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getChannelMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const messages = await prisma.message.findMany({
      where: { channelId: id },
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
