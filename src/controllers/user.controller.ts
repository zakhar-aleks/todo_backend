import { type Request, type Response } from "express";
import { prisma } from "../main.js";

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
				message: "User is not authorized",
			});
		}

		res.status(200).json({
			email: user.email,
			name: user.name,
			avatar: user?.avatar,
		});
	} catch (error) {
		res.status(500).json({
			message: "Internal server error",
		});
	}
};
