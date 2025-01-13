import { Router } from "express";
import { addNotification, checkNotification, deleteNotification, getAuthUserNotifications, streamAuthUserNotification } from "../controllers/notification.controllers";
import { addNotificationValidator, notificationValidator_param } from "../validators/notification.validator";

const router = Router();

router.get("/", getAuthUserNotifications);
router.get("/stream", streamAuthUserNotification);
router.post("/", addNotificationValidator, addNotification);
router.patch("/:id", notificationValidator_param, checkNotification);
router.delete("/:id", notificationValidator_param, deleteNotification);

export default router;
