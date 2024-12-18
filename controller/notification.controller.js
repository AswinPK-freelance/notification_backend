import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const getNotifications = async (req, res) => {
    try {
        const { fromDate, toDate, } = req.query;

        const whereConditions = {
            userId: req.user.userId,
            ...(fromDate && {
                createdAt: {
                    gte: new Date(`${fromDate}T00:00:00.000Z`), // Inclusive fromDate
                },
            }),
            ...(toDate && {
                createdAt: {
                    lt: new Date(`${toDate}T00:00:00.000Z`), // Exclusive end of the next day
                },
            }),
        };

        const notifications = await prisma.notification.findMany({
            where: whereConditions,
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching notifications',
            error: error.message,
        });
    }
};


export const getUnreadCount = async (req, res) => {
    try {
        const count = await prisma.notification.count({
            where: {
                userId: req.user.userId,
                read: false,
            },
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching unread count', error: error.message });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await prisma.notification.update({
            where: {
                id: parseInt(req.params.id),
                userId: req.user.userId,
            },
            data: {
                read: true,
            },
        });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
};


export const createNotification = async (req, res) => {
    try {
        const { title, message, role, userId, scheduledAt } = req.body;
        const io = req.app.get('io');
        let notifications = [];

        if (userId) {
            const notification = await prisma.notification.create({
                data: {
                    title,
                    message,
                    userId,
                    scheduledFor: scheduledAt ? new Date(scheduledAt) : null,
                },
            });
            notifications.push(notification);


            if (scheduledAt) {
                const delay = new Date(scheduledAt) - new Date();
                if (delay > 0) {
                    setTimeout(() => {
                        if (io) {
                            const namespace = role === 'ADMIN' ? '/admin' : '/user';
                            io.of(namespace).to(`${role.toLowerCase()}:${userId}`).emit('notification', notification);
                        }
                    }, delay);
                }
            } else {

                if (io) {
                    const namespace = role === 'ADMIN' ? '/admin' : '/user';
                    io.of(namespace).to(`${role.toLowerCase()}:${userId}`).emit('notification', notification);
                }
            }
        } else if (role) {
            const users = await prisma.user.findMany({
                where: { role },
                select: { id: true },
            });

            if (users.length) {
                const notificationData = users.map((user) => ({
                    title,
                    message,
                    userId: user.id,
                    scheduledFor: scheduledAt ? new Date(scheduledAt) : null,
                }));

                notifications = await prisma.notification.createMany({
                    data: notificationData,
                    skipDuplicates: true,
                });

                if (io) {
                    if (scheduledAt) {
                        const delay = new Date(scheduledAt) - new Date();
                        if (delay > 0) {
                            setTimeout(() => {
                                io.of(`/${role.toLowerCase()}`).emit('notification', {
                                    title,
                                    message,
                                    role,
                                    scheduledAt,
                                    createdAt: new Date(),
                                });
                            }, delay);
                        }
                    } else {
                        io.of(`/${role.toLowerCase()}`).emit('notification', {
                            title,
                            message,
                            role,
                            scheduledAt,
                            createdAt: new Date(),
                        });
                    }
                }
            }
        }

        res.status(201).json({ message: 'Notifications created successfully', notifications });
    } catch (error) {
        console.error('Notification creation error:', error);
        res.status(500).json({ message: 'Error creating notification', error: error.message });
    }
};
