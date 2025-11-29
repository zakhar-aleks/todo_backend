import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.js";
import { processFile } from "../services/image.service.js";
import { UpdateUserSchema } from "../models/user.model.js";

const router = Router();

router.get("/me", verifyToken, getProfile);
router.put(
	"/me",
	verifyToken,
	processFile,
	validate(UpdateUserSchema),
	updateProfile
);

export default router;
