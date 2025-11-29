import { type Request, type Response } from "express";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma, JWT_CONFIG } from "../main.js";
import { isPrismaError } from "../models/user.model.js";
import { uploadFileToS3 } from "../services/image.service.js";

const JWT_SECRET: string = process.env.JWT_SECRET! as string;

if (!JWT_SECRET) {
	throw new Error("JWT_SECRET environment variable is not set.");
}

async function hashPassword(plainPassword: string): Promise<string> {
	try {
		const hashedPassword: string = await bcrypt.hash(
			plainPassword,
			JWT_CONFIG.SALT_ROUNDS
		);
		return hashedPassword;
	} catch (error) {
		console.error("Error hashing password:", error);
		throw new Error("Password hashing failed");
	}
}

export const registerUser = async (req: Request, res: Response) => {
	const { email, name, password } = req.body;
	const avatar = req.file;

	const data: any = {
		email: email,
		name: name,
		password: await hashPassword(password),
	};

	if (avatar) {
		const key = await uploadFileToS3(avatar, "user-avatars");

		data.avatar = key;
	}

	try {
		const newUser = await prisma.user.create({ data: data });

		const payload = {
			id: newUser.id,
			email: newUser.email,
		};

		const token = jwt.sign(payload, JWT_SECRET, {
			expiresIn: "1d",
		});

		res.status(201).json({
			token: token,
		});
	} catch (error) {
		if (isPrismaError(error) && error.code === "P2002") {
			return res.status(409).json({
				error: "A user with this email is already registered",
			});
		}

		console.error("Uncaught DB Error:", error);

		return res.status(500).json({
			error: "Internal server error",
		});
	}
};

export const loginUser = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	try {
		const user = await prisma.user.findUnique({
			where: { email: email },
			select: {
				id: true,
				email: true,
				name: true,
				password: true,
				avatar: true,
			},
		});

		if (!user) {
			return res.status(401).json({
				error: "User is not authorized",
			});
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (isMatch) {
			const payload = {
				id: user.id,
				email: user.email,
			};

			const token = jwt.sign(payload, JWT_SECRET, {
				expiresIn: "1d",
			});

			return res.status(200).json({
				token: token,
			});
		} else {
			return res.status(401).json({
				error: "User is not authorized",
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "Internal server error",
		});
	}
};
