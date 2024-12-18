import express from 'express';
const router = express.Router();

import {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    createNotification,
} from '../controller/notification.controller.js';
import { checkRole } from '../middleware/auth.middleware.js';

router.get('/', getNotifications);
router.get('/unread/count', getUnreadCount);
router.put('/:id/read', markNotificationAsRead);
router.post('/', checkRole(['ADMIN']), createNotification);

export default router;
