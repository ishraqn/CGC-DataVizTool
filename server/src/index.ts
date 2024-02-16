// imports
import express, { Request, Response, Application, NextFunction } from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import compression from "compression";
import shapefileRoutes from "./routes/shapefileRoutes";
import fileRoutes from "./routes/fileRoutes";
import developerRoutes from "./routes/developerRoutes";
import { sessionMiddleware } from "./middleware/sessionsMiddleware";

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

// express module augmentation
declare module "express-session" {
	interface SessionData {
		views: number;
	}
	interface lastConversionSessionData {
		lastConversion?: { time: string; filePath: string };
	}
}

// constants for the server
const app: Application = express();
const PORT: string | undefined = process.env.PORT;

// rate limiter for the server
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5000, // limit each IP to 5000 requests per windowMs (bad must change)
});

// middleware for the server
app.use(morgan("dev"));
app.use(limiter);
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(compression());

// serve the static files from the data folder
app.use(
	"/api/v1/data-folder",
	express.static(path.resolve(__dirname, "data", "default", "simplified")), 
	express.static(path.resolve(__dirname, "data"))
);

// express-session middleware for user session management
app.use(sessionMiddleware);

// developer routes for basic testing purposes
app.use("/api/v1/dev", developerRoutes);

// main shapefile routes
app.use("/api/v1/shapefile", shapefileRoutes);

// file routes for file uploads and downloads
app.use("/api/v1", fileRoutes);

// catch all error middleware for the server
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
	console.error(err);
	res.status(err.status || 500).send(err.message || "Internal Server Error");
});

// start the server
app.listen(PORT, (): void => {
	console.log(`Server is running on port ${PORT}`);

	// // Open browser on server start
	// void import("open").then((open) => {
	//     open.default(`http://localhost:${PORT}`);
	// });
});
