import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
	deleteProfileAvatar,
	getProfile,
	updateProfile,
} from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.js";
import { uploadAvatar } from "../services/image.service.js";
import { UpdateUserSchema } from "../models/user.model.js";

const router = Router();

router.get("/me", verifyToken, getProfile);
router.put(
	"/me",
	verifyToken,
	uploadAvatar,
	validate(UpdateUserSchema),
	updateProfile
);
router.delete("/me/avatar", verifyToken, deleteProfileAvatar);

export default router;
