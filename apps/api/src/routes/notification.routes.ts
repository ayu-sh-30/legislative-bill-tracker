import { Router } from "express";

import {
  getMyNotificationsController,
  markNotificationReadController,
} from "../controllers/notification.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/me/notifications", requireAuth, getMyNotificationsController);
router.patch(
  "/me/notifications/:id/read",
  requireAuth,
  markNotificationReadController
);

export default router;