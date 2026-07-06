import { Router } from "express";
import {
  followBillController,
  unfollowBillController,
  getMyFollowsController,
} from "../controllers/follow.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/bills/:id/follow", requireAuth, followBillController);
router.delete("/bills/:id/follow", requireAuth, unfollowBillController);
router.get("/me/follows", requireAuth, getMyFollowsController);

export default router;
