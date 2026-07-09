// apps/api/src/routes/ai-ready-bills.routes.ts
import { Router } from "express";

import { listAiReadyBills } from "../controllers/ai-ready-bills.controller";

const router = Router();

router.get("/ai-ready-bills", listAiReadyBills);

export default router;