import notificationProps from "../types/notification.type";
import Notifications from "../models/notification.model";
import { NextFunction, Request, Response } from "express";
import createError from "../utils/error";
import { decodeHtmlEntities } from "../utils/decode";
import { validationResult } from "express-validator";

// Get notifications controller
export const getAuthUserNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userName } = req.session.user!;

    const notifications = await Notifications.find({
      to: userName,
    });
    if (!notifications) return createError({ message: "Notifications not found", statusCode: 404 });
    const getNotifications = notifications.map(notic => notic.toObject());

    res.status(200).json({
      message: "Notifications fetched successfully",
      data: getNotifications.map((notic) => ({
        ...notic,
        message: decodeHtmlEntities(notic.message),
      })),
      successfull: true,
    });
  } catch (error) {
    next(error);
  }
};
// Stream notification controller
export const streamAuthUserNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userName } = req.session.user!;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });
    res.flushHeaders();

    const pipeline = [
      { $match: { operationType: { $in: ["insert", "update", "delete"] } } },
    ];
    const watchNotifications = Notifications.watch(pipeline);

    watchNotifications.on("change", (change) => {
      const eventType = change.operationType;
      const notification = change.fullDocument as notificationProps;
      if (eventType === "delete") {
        // send notification id to client when notification is deleted
        const _id = change.documentKey._id;
        res.write(
          `data: ${JSON.stringify({ eventType, notification: { _id } })}\n\n`
        );
      } else {
        // send notification to client when post is inserted or updated
        if (notification.to === userName) {
          res.write(
            `data: ${JSON.stringify({
              eventType,
              notification: {
                ...notification,
                message: decodeHtmlEntities(notification.message),
              },
            })}\n\n`
          );
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
  } catch (error) {
    next(error);
  }
};
// Add notification controller
export const addNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { userName } = req.session.user!;
    const { type, to, message, url, targetTitle, options }: notificationProps = req.body;    

    let notification = new Notifications({
      type,
      message,
      url,
      from: userName,
      to,
      checked: false,
      targetTitle,
      options
    });
    notification = await notification.save();
    if (!notification) return createError({ message: "Failed to add notification", statusCode: 500 });
    const getNotification = notification.toObject();

    res.status(201).json({
      message: "Notification added successfully",
      data: {
        ...getNotification,
        message: decodeHtmlEntities(getNotification.message),
      },
      successfull: true,
    });
  } catch (error) {
    next(error);
  }
};
// Check notification controller
export const checkNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { id } = req.params;
    const notification = await Notifications.findByIdAndUpdate(
      id,
      { checked: true },
      { new: true }
    );
    if (!notification) return ({ message: "Notification not found", statusCode: 404 });
    const getNotification = notification.toObject();

    res.status(200).json({
      message: "Notification checked successfully",
      data: {
        ...getNotification,
        message: decodeHtmlEntities(getNotification.message || ""),
      },
      successfull: true,
    });
  } catch (error) {
    next(error);
  }
};
// Delete notification controller
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      createError({ message: errors.array()[0].msg, statusCode: 422 });

    const { id } = req.params;
    const notification = await Notifications.findByIdAndDelete(id);
    if (!notification)
      createError({ message: "Notification not found", statusCode: 404 });

    res.status(200).json({
      message: "Notification deleted successfully",
      data: notification,
      successfull: true,
    });
  } catch (error) {
    next(error);
  }
};
