import { type Request, type Response } from "express";
import { prisma } from "../main.js";
import { deleteFileFromS3, uploadFileToS3 } from "../services/image.service.js";

interface userPayload {
	id: number;
	email: string;
}

export const getProfile = async (req: Request, res: Response) => {
	const payload = req.token as userPayload;

	try {
		const user = await prisma.user.findUnique({
			where: { id: payload.id },
			select: {
				email: true,
				name: true,
				avatar: true,
			},
		});

		if (!user) {
			return res.status(401).json({
				error: "User is not authorized",
			});
		}

		res.status(200).json({
			email: user.email,
			name: user.name,
			avatar: user?.avatar,
		});
	} catch (error) {
		res.status(500).json({
			error: "Internal server error",
		});
	}
};

export const updateProfile = async (req: Request, res: Response) => {
	const payload = req.token as userPayload;
	const name = req.body.name;
	const avatar = req.file;
	const data: any = {
		name: name,
	};

	const user = await prisma.user.findUnique({
		where: { id: payload.id },
		select: { avatar: true },
	});

	if (avatar) {
		await deleteFileFromS3(user, res);
		data.avatar = await uploadFileToS3(avatar, "user-avatars");
	}

	try {
		const newUser = await prisma.user.update({
			where: {
				id: payload.id,
			},
			data: {
				name: data.name,
				avatar: data.avatar,
			},
		});

		res.status(200).json({
			email: newUser.email,
			name: newUser.name,
			avatar: newUser.avatar,
		});
	} catch (error) {
		res.status(500).json({
			error: "Internal server error",
		});
	}
};

export const deleteProfileAvatar = async (req: Request, res: Response) => {
	const payload = req.token as userPayload;

	try {
		const user = await prisma.user.findUnique({
			where: { id: payload.id },
			select: { avatar: true },
		});

		if (user?.avatar) {
			await deleteFileFromS3(user.avatar, res);
		}

		const updatedUser = await prisma.user.update({
			where: {
				id: payload.id,
			},
			data: {
				avatar: null,
			},
		});

		res.status(200).json({
			deleted: true,
		});
	} catch (error) {
		res.status(500).json({
			error: "Internal server error",
		});
	}
};
