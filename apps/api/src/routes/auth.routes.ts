import { Router } from "express";
import { getMyController, loginController, signupController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";


const router = Router();

router.post("/signup",signupController);
router.post("/login", loginController);
router.get("/me", requireAuth, getMyController);

export default router;