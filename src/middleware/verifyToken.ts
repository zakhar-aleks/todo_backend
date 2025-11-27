import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { type JwtPayload } from "jsonwebtoken";

const { JsonWebTokenError, TokenExpiredError, verify } = jwt;

declare global {
	namespace Express {
		interface Request {
			token?: string | JwtPayload;
		}
	}
}

export const verifyToken = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.get("Access-Token");

	if (!token)
		return res.status(401).json({ message: "User is not authorized" });

	try {
		const decoded = verify(token, process.env.JWT_SECRET!);
		req.token = decoded;

		next();
	} catch (error) {
		if (error instanceof TokenExpiredError) {
			return res.status(401).json({
				message: "User is not authorized",
				expiredAt: error.expiredAt,
			});
		}

		if (error instanceof JsonWebTokenError) {
			return res.status(401).json({
				message: "User is not authorized",
				details: error.message,
			});
		}

		return res.status(500).json({ message: "Internal Server Error" });
	}
};
