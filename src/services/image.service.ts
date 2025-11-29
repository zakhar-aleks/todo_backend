import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import dotenv from "dotenv";
import type { Request, Response, NextFunction, RequestHandler } from "express";

type MulterFile = Express.Multer.File;

dotenv.config({ path: "../../.env" });

const s3 = new S3Client({
	region: process.env.AWS_REGION!,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

const ALLOWED_TYPES = [
	"image/jpg",
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
];

const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		ALLOWED_TYPES.includes(file.mimetype)
			? cb(null, true)
			: cb(
					new Error(
						"Invalid avatar: allowed formats are jpg, jpeg, png, gif, webp"
					)
			  );
	},
});

export async function uploadFileToS3(
	file: MulterFile,
	folder = "user-avatars"
) {
	const key = `${folder}/${Date.now()}-${file.originalname.replace(
		/\s/g,
		"_"
	)}`;

	const params = {
		Bucket: process.env.S3_BUCKET_NAME!,
		Key: key,
		Body: file.buffer,
		ContentType: file.mimetype,
	};

	const command = new PutObjectCommand(params);

	try {
		await s3.send(command);
		return key;
	} catch (error) {
		console.error("S3 Upload Error:", error);
		throw new Error("Failed to upload file to S3");
	}
}

export const processFile = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const uploadMiddleware = upload.single("avatar") as RequestHandler;

	uploadMiddleware(req, res, (err: any) => {
		if (err instanceof multer.MulterError) {
			return res.status(500).json({
				error: "Internal server error",
			});
		} else if (err) {
			return res.status(400).json({
				error: err.message,
			});
		}

		next();
	});
};
