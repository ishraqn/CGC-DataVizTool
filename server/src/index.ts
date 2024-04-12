// imports
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import geoRoutes from "./routes/geoRoutes";
import mapRoutes from "./routes/mapRoutes";
import fileRoutes from "./routes/fileRoutes";
import shapefileRoutes from "./routes/shapefileRoutes";
import developerRoutes from "./routes/developerRoutes";
import cleanupTempFiles from "./utils/tempfileCleanupUtil";
import { sessionMiddleware } from "./middleware/sessionsMiddleware";
import express, { Request, Response, Application, NextFunction } from "express";

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

// uploaded file data interface
interface uploadFileData {
	name: string;
	path: string;
	size: number;
	type: string;
	lastModifiedDate: Date;
}

// express module augmentation
declare module "express-session" {
	interface SessionData {
		views: number;
		uploadFileList: { [key: string]: uploadFileData }; // uploadeded file list
	}
}

// constants for the server
const app: Application = express();
const PORT: string | number = process.env.PORT || 5120;

// rate limiter for the server
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 100, // limit each IP request to 100 requests per windowMs
});

// middleware for the server
app.use(morgan("short"));
app.use(limiter);
app.use(cookieParser());
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'"],
			imgSrc: [
				"'self'",
				"data:",
				"*.tile.openstreetmap.org",
			],
		},
	})
);
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "50mb" }));

// serve the static files from the data folder
app.use(
	"/api/v1/data-folder",
	express.static(path.resolve(__dirname, "data", "default", "simplified"))
);

app.use(express.static(path.resolve(__dirname, "../../client/dist")));

// express-session middleware for user session management
app.use(sessionMiddleware);

// developer routes for basic testing purposes
app.use("/api/v1/dev", developerRoutes);

// main shapefile routes
app.use("/api/v1/shapefile", shapefileRoutes);

// file routes for file uploads and downloads
app.use("/api/v1", fileRoutes);

// geo routes for spatial data processing
app.use("/api/v1/geo", geoRoutes);

// map routes for rendering maps
app.use("/api/v1/map", mapRoutes);

// catch all error middleware for the server
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
	if (!res.headersSent) {
		return _next(err);
	}
	console.error(err);
	res.status(500).send("Internal Server Error");
});

// cleanup function for temp files
const MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || "60") * 60 * 1000 // 1 hour if not specified
const CLEANUP_INTERVAL = 2 * (MAX_AGE); // 2 hours
cleanupTempFiles(MAX_AGE, CLEANUP_INTERVAL);

// start the server
const startServer = (port: number | string) => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    }).on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use. Please ensure that another instance of the application is not running or specify a different port in the environment variable.`);
            process.exit(1);
        } else {
            console.error(`An error occurred while starting the server: ${err.message}`);
            process.exit(1);
        }
    });
};

startServer(PORT);