import { Router } from "express";

import { listBills, getBillDetail, getBillTimelineDetail } from "../controllers/bill.controller";

const router = Router();

router.get("/", listBills);
router.get("/:id", getBillDetail);
router.get("/:id/timeline", getBillTimelineDetail);

export default router;
