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
import multer from 'multer';
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

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, 'uploads/temp'); // Save files to the 'uploads/temp' directory
    },
    filename: function (_req, file, cb) {
        cb(null, file.originalname); // Use the original filename for the uploaded file
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (_req, file, cb) => {
        const allowedFileTypes = ['.csv'];
        const extname = path.extname(file.originalname).toLowerCase();

        if (allowedFileTypes.includes(extname)) {
            cb(null, true);
        } else {
            cb(new Error('Only .csv files are allowed!'));
        }
        // Check file mimetype to ensure it's a CSV file - doesn't work
        // if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
        //     cb(null, true); // Accept the file
        // } else {
        //     cb(new Error('Only CSV files are allowed')); // Reject the file
        // }
    }
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
	express.static(path.resolve(__dirname, "data", "default", "simplified"))
);

// express-session middleware for user session management
app.use(sessionMiddleware);

// developer routes for basic testing purposes
app.use("/api/v1/dev", developerRoutes);

// Route for handling file upload
app.post('/upload', upload.single('csvFile'), (req: Request, res: Response) => {
    // Access the uploaded file via req.file
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // File uploaded successfully
    res.status(200).send('File uploaded successfully.');
    return;
});

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
