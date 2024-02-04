// imports
import express, { Request, Response, Application, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import compression from "compression";
import shapefileRoutes from "./routes/shapefileRoutes";
import developerRoutes from "./routes/developerRoutes";

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

// express module augmentation to add views to the session
declare module "express-session" {
    interface SessionData {
        views: number;
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

// express-session cookie configuration for user session management
app.use(
    session({
        secret: process.env.SECRET_KEY || "secret",
        resave: false,
        saveUninitialized: true,
        //ternary operator to check if the environment is production or development
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "strict",
            maxAge: 1000 * 30, // 30 seconds for testing purposes
        },
    })
);

console.log(path.resolve(__dirname, "data", "default", "simplified"));

// serve the static files from the data folder
app.use(
    "/api/v1/data-folder",
    express.static(path.resolve(__dirname, "data", "default", "simplified"))
);

// developer routes for basic testing purposes
app.use("/api/v1", developerRoutes);

// main shapefile routes
app.use("/api/v1/shapefile", shapefileRoutes);

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
