import express from "express";
import { PrismaClient } from "./generated/prisma";
import { validate } from "./middleware/validate.js";
import * as z from "zod";
import * as argon2 from "@node-rs/argon2";

const prisma = new PrismaClient();
const app = express();
const port: string | number = process.env.port || 3000;
app.use(express.json());

interface PrismaClientError {
	code: string;
	message: string;
}

const isPrismaError = (error: unknown): error is PrismaClientError => {
	return typeof error === "object" && error !== null && "code" in error;
};

async function hashPassword(plainPassword: string): Promise<string> {
	try {
		const hashedPassword: string = await argon2.hash(plainPassword);

		return hashedPassword;
	} catch (error) {
		console.error("Error hashing password:", error);

		throw new Error("Password hashing failed");
	}
}

const User = z.object({
	email: z.email().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
	name: z.string().min(2),
	password: z
		.string()
		.min(8)
		.regex(/[a-zA-Z]/),
	avatar: z.url().nullish(),
});

app.post("/api/auth/registration/", validate(User), async (req, res) => {
	const { email, name, password, avatar } = req.body;

	const data: any = {
		email: email,
		name: name,
		password: await hashPassword(password),
	};

	if (avatar) {
		data.avatar = avatar;
	}

	try {
		const newUser = await prisma.user.create({
			data: data,
		});

		res.status(201).json(newUser);
	} catch (error) {
		if (isPrismaError(error) && error.code === "P2002") {
			return res.status(409).json({
				error: "A user with this email is already registered",
			});
		}

		console.error("Uncaught DB Error:", error);

		const message = isPrismaError(error)
			? error.message
			: "An unexpected server error occurred.";
		return res.status(500).json({
			error: "An unexpected server error occurred.",
			details: message,
		});
	}
});

app.listen(port, () => {
	console.log(`Server is up and running on port ${port}`);
});
