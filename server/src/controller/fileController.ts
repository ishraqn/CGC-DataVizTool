import { Request, Response } from "express";

// handles the file after it has been uploaded (do something with the file after multer middleware has processed it)
export const fileController = {
    // upload: (req: Request, res: Response) => {
    // 	// logic to upload a file goes here
    // },
    // download: (req: Request, res: Response) => {
    info: (_req: Request, res: Response) => {
        res.json({ message: "File upload route" });
    },
};
