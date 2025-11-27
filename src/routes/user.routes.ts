import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getProfile } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", verifyToken, getProfile);

export default router;
