import { Router } from "express";
import {
	createTask,
	deleteTask,
	getTaskById,
	getTasks,
} from "../controllers/task.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { validate } from "../middleware/validate.js";
import { taskSchema } from "../models/task.model.js";
import { uploadImages } from "../services/image.service.js";
import { verifyAccess } from "../middleware/verifyAccess.js";

const router = Router();

router.get("/", verifyToken, getTasks);
router.get("/:taskId", verifyToken, verifyAccess, getTaskById);
router.post("/", verifyToken, uploadImages, validate(taskSchema), createTask);
router.delete("/:taskId", verifyToken, verifyAccess, deleteTask);

export default router;
