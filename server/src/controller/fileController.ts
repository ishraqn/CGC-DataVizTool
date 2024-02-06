import { Request, Response } from "express";

// handles the file after it has been uploaded (do something with the file after multer middleware has processed it)
export const fileController = {
	upload: (_req: Request, _res: Response) => {
		// Access the uploaded file via req.file
		if (!_req.file) {
			return _res.status(400).send('No file uploaded.');
		}
	
		// File uploaded successfully
		_res.status(200).send('File uploaded successfully.');
		return;
	}
	};
	// download: (req: Request, res: Response) => {
