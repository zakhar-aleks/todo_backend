import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import dotenv from "dotenv";

type MulterFile = Express.Multer.File;

dotenv.config({ path: "../../.env" });

const s3 = new S3Client({
	region: process.env.AWS_REGION!,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

export async function uploadFileToS3(file: MulterFile, folder = "uploads") {
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
