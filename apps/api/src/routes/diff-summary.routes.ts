import { Router } from "express";

import { summarizeBillDiffController } from "../controllers/diff-summary.controller";

const router = Router();

router.post("/:id/diff-summary", summarizeBillDiffController);

export default router;