import { Router } from "express";
import { createTask } from "../controllers/task.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { validate } from "../middleware/validate.js";
import { taskSchema } from "../models/task.model.js";

const router = Router();

router.post("/", verifyToken, validate(taskSchema), createTask);

export default router;
