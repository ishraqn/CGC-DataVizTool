import { Request, Response, NextFunction } from "express";
import {join} from "path";

// handles the file after it has been uploaded (do something with the file after multer middleware has processed it)
export const fileController = {
	upload: (req: Request, res: Response, next: NextFunction) => {
		// Access the uploaded file via req.file
		if (!req.file) {
			return res.status(400).send('No file uploaded.');
		}
		try{
		// Create the file details data
		const fileDetails = {
			name: req.file.filename,
			path: join(req.file.destination, req.file.filename),
			size: req.file.size,
			type: req.file.mimetype,
			lastModifiedDate: new Date()
		}

		// init the session uploadFileList if it doesn't exist
		if (!req.session.uploadFileList) {
			req.session.uploadFileList = {};
			
		}

		// add the file details to the session uploadFileList
		req.session.uploadFileList[fileDetails.name] = fileDetails;
	} catch (error) {
		// An error occurred
		console.error("Error in adding the file to the list", error);
		res.status(500).send("An error occurred while adding the file to the list.");
		return;
	}
	
		// File uploaded successfully
		res.status(200).send('File uploaded successfully.');
		next();
		return;
	},

	// return the last uploaded file by the user
	lastUploadFile: (req: Request, res: Response, next: NextFunction): void => {
        if (req.session.uploadFileList) {
            const uploadArray = req.session.uploadFileList;
            const keys = Object.keys(uploadArray);
            const lastFileKey = keys[keys.length - 1];
            const lastFile = uploadArray[lastFileKey];
            res.locals.lastUploadedFile = lastFile;
			next();
        } else {
            res.json({ message: "No files uploaded yet." });
        }
    },

	};
	// download: (req: Request, res: Response) => {
