import * as z from "zod";

export const taskSchema = z.object({
	title: z.string().min(2),
	description: z.string().optional(),
});
