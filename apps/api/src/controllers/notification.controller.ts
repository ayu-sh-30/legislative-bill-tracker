import type { NextFunction, Request, Response } from "express";

import { AppError } from "../middleware/error.middleware";
import {
  getNotificationsForUser,
  markNotificationAsRead,
} from "../services/notification.service";

type NotificationIdParams = {
  id: string;
};

function getAuthenticatedUserId(req: Request) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  return req.user.id;
}

export async function getMyNotificationsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getAuthenticatedUserId(req);
    const notifications = await getNotificationsForUser(userId);

    res.status(200).json({
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationReadController(
  req: Request<NotificationIdParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getAuthenticatedUserId(req);
    const notification = await markNotificationAsRead(userId, req.params.id);

    res.status(200).json({
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}