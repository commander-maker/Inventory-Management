import express from "express";
import {
    getMyNotifications,
    markRead,
    markAllRead,
    removeNotification
} from "../controllers/notification.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getMyNotifications);
router.put("/:id/read", markRead);
router.put("/read-all", markAllRead);
router.delete("/:id", removeNotification);

export default router;
