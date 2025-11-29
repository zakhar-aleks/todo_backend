import { type Request, type Response, type NextFunction } from "express";
import { type ZodObject, ZodError } from "zod";

export const validate =
	(schema: ZodObject) =>
	(req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse(req.body);

			return next();
		} catch (error) {
			if (error instanceof ZodError) {
				const formattedErrors = error.issues.map((err) => ({
					path: err.path.join("."),
					error: err.message,
				}));

				return res.status(400).json({
					error: "Validation failed",
					errors: formattedErrors,
				});
			}

			return res.status(500).json({ error: "Internal server error" });
		}
	};
