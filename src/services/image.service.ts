import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
} from "@aws-sdk/client-s3";
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

export const deleteFileFromS3 = async (key: string, res: Response) => {
	const params = {
		Bucket: process.env.S3_BUCKET_NAME!,
		Key: key,
	};
	const command = new DeleteObjectCommand(params);

	try {
		await s3.send(command);
	} catch (err) {
		console.error(err);

		res.status(500).json({
			error: "Internal server error",
		});
	}
};

export async function uploadMultipleFilesToS3(
	files: MulterFile[],
	folder = "task-images"
) {
	const uploadPromises = files.map((file) => uploadFileToS3(file, folder));

	try {
		const keys = await Promise.all(uploadPromises);
		return keys;
	} catch (error) {
		console.error("Batch S3 Upload Error:", error);
		throw new Error("Failed to upload one or more files to S3");
	}
}

export const uploadMiddleware = (multerInstance: RequestHandler) => {
	return (req: Request, res: Response, next: NextFunction) => {
		multerInstance(req, res, (err: any) => {
			if (err) {
				return next(err);
			}
			next();
		});
	};
};

export const uploadAvatar = uploadMiddleware(upload.single("avatar"));
export const uploadImages = uploadMiddleware(upload.array("files", 12));
