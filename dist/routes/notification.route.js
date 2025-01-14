"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controllers_1 = require("../controllers/notification.controllers");
const notification_validator_1 = require("../validators/notification.validator");
const router = (0, express_1.Router)();
router.get("/", notification_controllers_1.getAuthUserNotifications);
router.get("/stream", notification_controllers_1.streamAuthUserNotification);
router.post("/", notification_validator_1.addNotificationValidator, notification_controllers_1.addNotification);
router.patch("/:id", notification_validator_1.notificationValidator_param, notification_controllers_1.checkNotification);
router.delete("/:id", notification_validator_1.notificationValidator_param, notification_controllers_1.deleteNotification);
exports.default = router;
