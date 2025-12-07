import * as z from "zod";

export const taskSchema = z.object({
	title: z.string().min(2),
	description: z.string().optional(),
});

export const updateTaskSchema = z.object({
	title: z.string().min(2),
	description: z.string().optional(),
	done: z
		.enum(["true", "false"])
		.transform((val) => val === "true")
		.or(z.boolean())
		.optional(),
	exitingFileIds: z.array(z.string()).optional(),
});

export const patchTaskSchema = z.object({
	title: z.string().min(2).optional(),
	description: z.string().optional(),
	done: z
		.enum(["true", "false"])
		.transform((val) => val === "true")
		.or(z.boolean())
		.optional(),
	exitingFileIds: z.array(z.string()).optional(),
});
