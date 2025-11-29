import { type Request, type Response } from "express";
import { prisma } from "../main.js";
import { uploadMultipleFilesToS3 } from "../services/image.service.js";

interface userPayload {
	id: string;
	email: string;
}

const createImageFile = async (
	taskId: string,
	files: Express.Multer.File[]
) => {
	const keys = await uploadMultipleFilesToS3(files, "task-images");
	const dbPromises = keys.map((key) => {
		return prisma.file.create({
			data: {
				image: key!,
				taskId: taskId,
			},
		});
	});

	await Promise.all(dbPromises);
};

export const createTask = async (req: Request, res: Response) => {
	const { title, description } = req.body;
	const payload = req.token as userPayload;
	const data: any = {
		title: title,
	};

	if (description) {
		data.description = description;
	}

	const currentUser = await prisma.user.findUnique({
		where: { id: payload.id },
		select: { id: true },
	});

	if (!currentUser) {
		return res.status(500).json({
			error: "Internal server error",
		});
	}

	try {
		const files = req.files as Express.Multer.File[];

		const newTask = await prisma.task.create({
			data: {
				title: data.title,
				description: data.description,
				done: false,
				user: {
					connect: { id: currentUser.id },
				},
			},
		});

		if (files && files.length !== 0) {
			await createImageFile(newTask.id, files);
		}

		const currentTask = await prisma.task.findUnique({
			where: { id: newTask.id },
			select: {
				id: true,
				title: true,
				description: true,
				done: true,
				files: true,
			},
		});

		res.status(201).json(currentTask);
	} catch (err) {
		res.status(500).json({
			error: "Internal server error",
		});
	}
};
