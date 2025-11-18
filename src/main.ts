import express from "express";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.routes.js";

const port: string | number = process.env.port || 3000;
const JWT_SECRET: string = process.env.JWT_SECRET! as string;

if (!JWT_SECRET) {
	throw new Error("JWT_SECRET environment variable is not set.");
}

export const prisma = new PrismaClient();

interface JWTConfig {
	SECRET: string;
	EXPIRY: string;
	SALT_ROUNDS: number;
}

export const JWT_CONFIG: JWTConfig = {
	SECRET: JWT_SECRET,
	EXPIRY: "1d",
	SALT_ROUNDS: 10,
};

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

app.listen(port, () => {
	console.log(`Server is up and running on port ${port}`);
});
