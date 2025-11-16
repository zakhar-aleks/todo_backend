import express from "express";
import { PrismaClient } from "./generated/prisma";
import { validate } from "./middleware/validate.js";
import * as z from "zod";

const prisma = new PrismaClient();
const app = express();
const port: string | number = process.env.port || 3000;

app.use(express.json());

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
		password: password,
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
		res.status(409).json({
			error: error,
		});
	}
});

app.listen(port, () => {
	console.log(`Server is up and running on port ${port}`);
});
