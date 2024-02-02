import express, { Request, Response, Application, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import compression from "compression";
import shapefileRoutes from "./routes/shapefileRoutes";

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

const app: Application = express();
const PORT: string | number = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

console.log(path.resolve(__dirname, "..", "src", "data"));
app.use(
	"/api/v1/data-folder",
	express.static(path.resolve(__dirname, "..","src","data"))
);

app.get("/api/v1/init", (_req: Request, res: Response): void => {
	res.json({ message: "CGC Dev Init 🚀" });
});

app.use("/api/v1/shapefile", shapefileRoutes);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
	console.error(err);
	res.status(err.status || 500).send(err.message || "Internal Server Error");
});

app.listen(PORT, (): void => {
	console.log(`Server is running on port ${PORT}`);

	// // Open browser on server start
	// void import("open").then((open) => {
	//     open.default(`http://localhost:${PORT}`);
	// });
});
