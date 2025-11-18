import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { UserSchema, LoginUserSchema } from "../models/user.model.js";
import { upload } from "../services/image.service.js";

const router = Router();

router.post(
	"/registration",
	upload.single("avatar"),
	validate(UserSchema),
	registerUser
);

router.post("/login", validate(LoginUserSchema), loginUser);

export default router;
