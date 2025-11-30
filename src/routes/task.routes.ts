import { Router } from "express";
import { createTask, getTasks } from "../controllers/task.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { validate } from "../middleware/validate.js";
import { taskSchema } from "../models/task.model.js";
import { uploadImages } from "../services/image.service.js";

const router = Router();

router.get("/", verifyToken, getTasks);
router.post("/", verifyToken, uploadImages, validate(taskSchema), createTask);

export default router;
