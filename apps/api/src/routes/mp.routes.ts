import { Router } from "express";
import { listMps, getMpActivityList, getMpDetails } from "../controllers/mp.controller";

const router = Router();

router.get('/', listMps);
router.get('/:id', getMpDetails);
router.get('/:id/activities', getMpActivityList);

export default router;