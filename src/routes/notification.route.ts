import { Router } from "express";
import { addNotification, checkNotification, deleteNotification, getAuthUserNotifications, streamAuthUserNotification } from "../controllers/notification.controllers";
import { addNotificationValidator, notificationValidator_param } from "../validators/notification.validator";
import { isAuthenticated } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", isAuthenticated, getAuthUserNotifications);
router.get("/stream", isAuthenticated, streamAuthUserNotification);
router.post("/", addNotificationValidator, isAuthenticated, addNotification);
router.patch("/:id", notificationValidator_param, isAuthenticated, checkNotification);
router.delete("/:id", notificationValidator_param, isAuthenticated, deleteNotification);

export default router;
