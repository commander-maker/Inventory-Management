import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all notifications for a user
export const getUserNotifications = async (userId) => {
    return await prisma.notification.findMany({
        where: { userId: parseInt(userId) },
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit to last 50
    });
};

// Create a notification
export const createNotification = async (userId, data) => {
    const { title, message, type } = data;
    return await prisma.notification.create({
        data: {
            userId: parseInt(userId),
            title,
            message,
            type: type || "info"
        }
    });
};

// Mark notification as read
export const markAsRead = async (id) => {
    return await prisma.notification.update({
        where: { id: parseInt(id) },
        data: { isRead: true }
    });
};

// Mark all as read for a user
export const markAllAsRead = async (userId) => {
    return await prisma.notification.updateMany({
        where: {
            userId: parseInt(userId),
            isRead: false
        },
        data: { isRead: true }
    });
};

// Delete notification
export const deleteNotification = async (id) => {
    return await prisma.notification.delete({
        where: { id: parseInt(id) }
    });
};

// Notify all admins
export const notifyAdmins = async (data) => {
    const admins = await prisma.user.findMany({
        where: { role: 'admin' }
    });

    const notifications = admins.map(admin => ({
        userId: admin.id,
        title: data.title,
        message: data.message,
        type: data.type || "info"
    }));

    return await prisma.notification.createMany({
        data: notifications
    });
};
