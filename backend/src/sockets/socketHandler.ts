import { Server, Socket } from 'socket.io';
import { prisma } from '../server';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

export const setupSockets = (io: Server) => {
  io.use((socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.token || socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      socket.data.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId} (socket: ${socket.id})`);

    socket.on('join_channel', (channelId: string) => {
      socket.join(channelId);
      console.log(`User ${userId} joined channel ${channelId}`);
    });

    socket.on('send_message', async (data: { channelId: string; content: string }) => {
      try {
        const { channelId, content } = data;
        
        const message = await prisma.message.create({
          data: {
            content,
            channelId,
            userId
          },
          include: { user: { select: { id: true, username: true } } }
        });

        io.to(channelId).emit('receive_message', message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });
};
