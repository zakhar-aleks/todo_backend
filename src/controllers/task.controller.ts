import { type Request, type Response } from "express";
import { prisma } from "../main.js";
import {
	deleteMultipleFilesFromS3,
	getImageUrl,
	uploadMultipleFilesToS3,
} from "../services/image.service.js";

interface userPayload {
	id: string;
	email: string;
}

interface imageFile {
	id: string;
	image: string;
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

export const getTasks = async (req: Request, res: Response) => {
	const payload = req.token as userPayload;

	try {
		const userTasks = await prisma.task.findMany({
			where: { userId: payload.id },
			include: { files: true },
		});

		const tasksWithUrls = await Promise.all(
			userTasks.map(async (task) => {
				const filesWithUrls = await Promise.all(
					task.files.map(async (file) => {
						const image = await getImageUrl(file.image);
						return { ...file, image };
					})
				);

				return { ...task, files: filesWithUrls };
			})
		);

		res.status(200).json(tasksWithUrls);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: "Internal sever error",
		});
	}
};

export const getTaskById = async (req: Request, res: Response) => {
	const { taskId } = req.params;

	if (!taskId) {
		res.status(500).json({
			error: "Internal server error",
		});
		return;
	}

	try {
		const currentTask = await prisma.task.findUnique({
			where: { id: taskId! },
			include: { files: true },
		});

		if (!currentTask) {
			res.status(500).json({
				error: "Internal server error",
			});
			return;
		}

		const taskWithUrl = await Promise.all(
			currentTask.files.map(async (file) => {
				const image = await getImageUrl(file.image);
				return { ...currentTask, files: { ...file, image } };
			})
		);

		res.status(200).json(taskWithUrl);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: "Internal server error",
		});
	}
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
		const filesWithUrls = await Promise.all(
			(currentTask?.files || []).map(async (file) => {
				const image = await getImageUrl(file.image);
				return { ...file, image };
			})
		);

		res.status(201).json({ ...currentTask, files: filesWithUrls });
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: "Internal server error",
		});
	}
};

export const updateTask = async (req: Request, res: Response) => {
	const { taskId } = req.params;
	const { title, description, done } = req.body;
	const files = req.files as Express.Multer.File[];
	let existingFileIds: string[] | undefined = undefined;
	const data: any = {};

	if (!taskId) {
		res.status(500).json({
			error: "Internal server error",
		});
		return;
	}

	if (title !== undefined) {
		data.title = title;
	}

	if (description !== undefined) {
		data.description = description;
	}

	if (done !== undefined) {
		data.done = done === "true" || done === true;
	}

	try {
		const currentTask = await prisma.task.findUnique({
			where: { id: taskId! },
			include: { files: true },
		});

		if (!currentTask) {
			res.status(404).json({
				error: "Invalid taskId: no task found with this taskId",
			});

			return;
		}

		if (
			req.body.existingFileIds !== undefined &&
			req.body.existingFileIds !== ""
		) {
			const rawIds = req.body.existingFileIds;

			if (Array.isArray(rawIds)) {
				existingFileIds = rawIds as string[];
			} else if (typeof rawIds === "string") {
				try {
					const parsed = JSON.parse(rawIds);
					existingFileIds = Array.isArray(parsed) ? parsed : [rawIds];
				} catch {
					existingFileIds = [rawIds];
				}
			}
		}

		if (existingFileIds !== undefined) {
			const cleanIdsToKeep = existingFileIds.map((id) =>
				id.trim().replace(/^"|"$/g, "")
			);

			const filesToDelete = currentTask.files.filter(
				(file) => !cleanIdsToKeep.includes(file.id)
			);

			if (filesToDelete.length > 0) {
				await deleteMultipleFilesFromS3(
					filesToDelete.map((f) => f.image)
				);
				await prisma.file.deleteMany({
					where: { id: { in: filesToDelete.map((f) => f.id) } },
				});
			}
		}

		if (Object.keys(data).length > 0) {
			await prisma.task.update({
				where: { id: taskId },
				data: data,
			});
		}

		if (files && files.length !== 0) {
			await createImageFile(taskId, files);
		}

		const newTask = await prisma.task.findUnique({
			where: { id: taskId! },
			include: { files: true },
		});

		if (!newTask) {
			return;
		}

		const filesWithUrls = await Promise.all(
			newTask.files.map(async (file) => {
				const image = await getImageUrl(file.image);
				return { ...file, image };
			})
		);

		res.status(200).json({ ...newTask, files: filesWithUrls });
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: "Internal server error",
		});
	}
};

export const deleteTask = async (req: Request, res: Response) => {
	const { taskId } = req.params;

	if (!taskId) {
		res.status(500).json({
			error: "Internal server error",
		});
		return;
	}

	try {
		const currentTask = await prisma.task.findUnique({
			where: { id: taskId! },
			include: { files: true },
		});

		if (!currentTask) {
			res.status(500).json({
				error: "Internal server error",
			});
			return;
		}

		if (currentTask.files && currentTask.files.length > 0) {
			await deleteMultipleFilesFromS3(
				currentTask.files.map((f: imageFile) => f.image)
			);
		}

		await prisma.task.delete({
			where: { id: taskId! },
		});

		res.status(200).json({
			deleted: true,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: "Internal server error",
		});
	}
};
