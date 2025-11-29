import { type Request, type Response } from "express";
import { prisma } from "../main.js";

interface userPayload {
	id: string;
	email: string;
}

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

		res.status(201).json(newTask);
	} catch (err) {
		res.status(500).json({
			error: "Internal server error",
		});
	}
};
