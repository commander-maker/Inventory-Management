import * as NotificationService from "../services/notification.service.js";

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await NotificationService.getUserNotifications(req.user.id);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markRead = async (req, res) => {
    try {
        const notification = await NotificationService.markAsRead(req.params.id);
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAllRead = async (req, res) => {
    try {
        await NotificationService.markAllAsRead(req.user.id);
        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeNotification = async (req, res) => {
    try {
        await NotificationService.deleteNotification(req.params.id);
        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
