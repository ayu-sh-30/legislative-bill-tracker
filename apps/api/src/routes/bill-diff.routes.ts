import { Router } from "express";

import { getBillDiffController } from "../controllers/bill-diff.controller";

const router = Router();

router.get("/:id/diff", getBillDiffController);

export default router;