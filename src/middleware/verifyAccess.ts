import type { Request, Response, NextFunction } from "express";
import { prisma } from "../main.js";

interface userPayload {
	id: string;
	email: string;
}

export const verifyAccess = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { taskId } = req.params;
	const payload = req.token as userPayload;

	if (!taskId) {
		res.status(400).json({ error: "Invalid taskId: taskId is required" });
		return;
	}

	try {
		const currentTask = await prisma.task.findUnique({
			where: { id: taskId },
			select: { userId: true },
		});

		if (!currentTask) {
			res.status(404).json({
				error: "Invalid taskId: no task found with this taskId",
			});
			return;
		}

		if (currentTask.userId !== payload.id) {
			res.status(403).json({
				error: "User does not have access to this resource",
			});
			return;
		}

		next();
	} catch (err) {
		res.status(500).json({
			error: "Internal server error",
		});
	}
};
