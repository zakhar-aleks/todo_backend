import express from "express";
import { PrismaClient } from "./generated/prisma";
import { validate } from "./middleware/validate.js";
import * as z from "zod";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "1d";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();
const port: string | number = process.env.port || 3000;
app.use(express.json());

interface PrismaClientError {
	code: string;
	message: string;
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

const loginUser = z.object({
	email: z.email().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
	password: z
		.string()
		.min(8)
		.regex(/[a-zA-Z]/),
});

const isPrismaError = (error: unknown): error is PrismaClientError => {
	return typeof error === "object" && error !== null && "code" in error;
};

async function hashPassword(plainPassword: string): Promise<string> {
	try {
		const hashedPassword: string = await bcrypt.hash(
			plainPassword,
			SALT_ROUNDS
		);

		return hashedPassword;
	} catch (error) {
		console.error("Error hashing password:", error);

		throw new Error("Password hashing failed");
	}
}

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

		const { password, ...userWithoutPassword } = newUser;

		const payload = {
			id: newUser.id,
			email: newUser.email,
		};

		const token = jwt.sign(payload, JWT_SECRET, {
			expiresIn: TOKEN_EXPIRY,
		});

		res.status(201).json({
			token: token,
			user: userWithoutPassword,
		});
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

app.post("/api/auth/login/", validate(loginUser), async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await prisma.User.findUnique({
			where: {
				email: email,
			},
		});

		if (user) {
			const isMatch = await bcrypt.compare(password, user.password);

			if (isMatch) {
				const payload = {
					id: user.id,
					email: user.email,
				};

				const token = jwt.sign(payload, JWT_SECRET, {
					expiresIn: TOKEN_EXPIRY,
				});

				return res.status(200).json({
					token: token,
					user: {
						id: user.id,
						email: user.email,
						name: user.name,
					},
				});
			} else {
				res.status(401).json({
					error: "User is not authorized",
				});
			}
		} else {
			res.status(401).json({
				error: "User is not authorized",
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: "Internal server error",
		});
	}
});

app.listen(port, () => {
	console.log(`Server is up and running on port ${port}`);
});
