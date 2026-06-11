import { Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';

export const createServer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const newServer = await prisma.server.create({
      data: {
        name,
        ownerId: userId,
        memberships: {
          create: { userId }
        }
      }
    });

    res.json(newServer);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserServers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const memberships = await prisma.serverMembership.findMany({
      where: { userId },
      include: { server: true }
    });

    const servers = memberships.map(m => m.server);
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getServerDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const server = await prisma.server.findUnique({
      where: { id },
      include: { channels: true, memberships: { include: { user: { select: { id: true, username: true } } } } }
    });

    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    res.json(server);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const joinServer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const serverId = req.params.id as string;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    const existingMembership = await prisma.serverMembership.findUnique({
      where: { userId_serverId: { userId, serverId } }
    });

    if (existingMembership) {
      res.status(400).json({ error: 'Already a member of this server' });
      return;
    }

    await prisma.serverMembership.create({
      data: { userId, serverId }
    });

    res.json({ message: 'Successfully joined the server' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
