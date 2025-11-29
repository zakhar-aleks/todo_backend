import * as z from "zod";

export interface PrismaClientError {
	code: string;
	message: string;
}

export const UserSchema = z.object({
	email: z
		.string()
		.email()
		.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
	name: z.string().min(2),
	password: z
		.string()
		.min(8)
		.regex(/[a-zA-Z]/),
});

export const LoginUserSchema = z.object({
	email: z
		.string()
		.email()
		.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
	password: z
		.string()
		.min(8)
		.regex(/[a-zA-Z]/),
});

export const UpdateUserSchema = z.object({
	name: z.string().min(2),
});

export const isPrismaError = (error: unknown): error is PrismaClientError => {
	return typeof error === "object" && error !== null && "code" in error;
};
