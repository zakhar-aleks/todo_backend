import { Router } from "express";
import {
	createTask,
	deleteAttachment,
	deleteTask,
	getAllTasks,
	getTaskById,
	getTasks,
	updateTask,
} from "../controllers/task.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { validate } from "../middleware/validate.js";
import {
	patchTaskSchema,
	taskSchema,
	updateTaskSchema,
} from "../models/task.model.js";
import { uploadImages } from "../services/image.service.js";
import { verifyAccess } from "../middleware/verifyAccess.js";

const router = Router();

router.get("/", verifyToken, getTasks);
router.get("/all", verifyToken, getAllTasks);
router.get("/:taskId", verifyToken, verifyAccess, getTaskById);
router.post("/", verifyToken, uploadImages, validate(taskSchema), createTask);
router.put(
	"/:taskId",
	verifyToken,
	uploadImages,
	verifyAccess,
	validate(updateTaskSchema),
	updateTask
);
router.patch(
	"/:taskId",
	verifyToken,
	uploadImages,
	verifyAccess,
	validate(patchTaskSchema),
	updateTask
);
router.delete("/:taskId", verifyToken, verifyAccess, deleteTask);
router.delete(
	"/:taskId/attachments/:fileId",
	verifyToken,
	verifyAccess,
	deleteAttachment
);

export default router;
