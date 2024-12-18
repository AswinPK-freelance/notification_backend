import { authenticateSocket } from "./midlleware.js";

export const setupSocketIO = (io) => {
    io.use(authenticateSocket);

    const adminNamespace = io.of('/admin');
    adminNamespace.use(authenticateSocket);

    adminNamespace.on('connection', (socket) => {

        socket.join(`admin:${socket.user.userId}`);

        socket.on('broadcast', async (data) => {
            if (socket.user.role !== 'ADMIN') return;

            const users = await prisma.user.findMany({
                where: { role: 'USER' },
                select: { id: true },
            });

            users.forEach(user => {
                io.of('/user').to(`user:${user.id}`).emit('notification', {
                    title: data.title,
                    message: data.message,
                    timestamp: new Date()
                });
            });

            adminNamespace.emit('notification', {
                title: data.title,
                message: `Broadcast: ${data.message}`,
                timestamp: new Date(),
            });
        });

        socket.on('disconnect', () => {
            console.log('Admin disconnected:', socket.user.userId);
        });
    });

    const userNamespace = io.of('/user');
    userNamespace.use(authenticateSocket);

    userNamespace.on('connection', (socket) => {

        socket.join(`user:${socket.user.userId}`);

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.user.userId);
        });
    });

    return io;
};