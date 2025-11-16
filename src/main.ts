import express, {
	type Application,
	type Request,
	type Response,
} from "express";

const app: Application = express();
const port: number | string = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
	res.status(200).json({ message: "OK" });
});

app.listen(port, () => {
	console.log(`Server is up and running on the ${port} port!`);
});
