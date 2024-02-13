import { Request, Response } from "express";

// handles the file after it has been uploaded (do something with the file after multer middleware has processed it)
export const fileController = {
	upload: (req: Request, res: Response) => {
		// Access the uploaded file via req.file
		if (!req.file) {
			return res.status(400).send('No file uploaded.');
		}
		// File uploaded successfully
		res.status(200).send('File uploaded successfully.');
		return;
	}
	};
	// download: (req: Request, res: Response) => {
