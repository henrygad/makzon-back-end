"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.checkNotification = exports.addNotification = exports.streamAuthUserNotification = exports.getAuthUserNotifications = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
const error_1 = __importDefault(require("../utils/error"));
const decode_1 = require("../utils/decode");
const express_validator_1 = require("express-validator");
// Get notifications controller
const getAuthUserNotifications = async (req, res, next) => {
    try {
        const user = req.user;
        const notifications = await notification_model_1.default.find({
            to: user.userName,
        });
        if (!notifications)
            (0, error_1.default)({ message: "Notifications not found", statusCode: 404 });
        res.status(200).json({
            message: "Notifications fetched successfully",
            data: notifications.map((notification) => ({
                ...notification,
                message: (0, decode_1.decodeHtmlEntities)(notification.message),
            })),
            successfull: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAuthUserNotifications = getAuthUserNotifications;
// Stream notification controller
const streamAuthUserNotification = async (req, res, next) => {
    try {
        const user = req.user;
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Connection": "keep-alive",
            "Cache-Control": "no-cache"
        });
        res.flushHeaders();
        const pipeline = [{ $match: { operationType: { $in: ["insert", "update", "delete"] } } }];
        const watchNotifications = notification_model_1.default.watch(pipeline);
        watchNotifications.on("change", (change) => {
            const eventType = change.operationType;
            const notification = change.fullDocument;
            if (eventType === "delete") {
                // send notification id to client when notification is deleted
                const _id = change.documentKey._id;
                res.write(`data: ${JSON.stringify({ eventType, notification: { _id } })}\n\n`);
            }
            else {
                // send notification to client when post is inserted or updated
                if (notification.to === user.userName) {
                    res.write(`data: ${JSON.stringify({
                        eventType,
                        notification: {
                            ...notification,
                            message: (0, decode_1.decodeHtmlEntities)(notification.message),
                        },
                    })}\n\n`);
                }
            }
        });
        watchNotifications.on("error", (error) => {
            // listen for errors in notifications collection
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        });
        req.on("end", () => {
            // End the stream when client closes connection
            watchNotifications.close();
            res.end();
        });
    }
    catch (error) {
        next(error);
    }
};
exports.streamAuthUserNotification = streamAuthUserNotification;
// Add notification controller
const addNotification = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const user = req.user;
        const { type, to, message, url } = req.body;
        let notification = new notification_model_1.default({
            type,
            message,
            url,
            from: user.userName,
            to,
            checked: false,
        });
        notification = await notification.save();
        if (!notification)
            (0, error_1.default)({ message: "Failed to add notification", statusCode: 500 });
        res.status(201).json({
            message: "Notification added successfully",
            data: {
                ...notification,
                message: (0, decode_1.decodeHtmlEntities)(notification.message),
            },
            successfull: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addNotification = addNotification;
// Check notification controller
const checkNotification = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { id } = req.params;
        const notification = await notification_model_1.default.findByIdAndUpdate(id, { checked: true }, { new: true });
        if (!notification)
            (0, error_1.default)({ message: "Notification not found", statusCode: 404 });
        res.status(200).json({
            message: "Notification checked successfully",
            data: {
                ...notification,
                message: (0, decode_1.decodeHtmlEntities)(notification?.message || ""),
            },
            successfull: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.checkNotification = checkNotification;
// Delete notification controller
const deleteNotification = async (req, res, next) => {
    try {
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            (0, error_1.default)({ message: errors.array()[0].msg, statusCode: 422 });
        const { id } = req.params;
        const notification = await notification_model_1.default.findByIdAndDelete(id);
        if (!notification)
            (0, error_1.default)({ message: "Notification not found", statusCode: 404 });
        res.status(200).json({
            message: "Notification deleted successfully",
            data: notification,
            successfull: true,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteNotification = deleteNotification;
