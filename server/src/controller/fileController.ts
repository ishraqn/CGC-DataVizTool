import { Request, Response, NextFunction } from "express";
import { join, extname, dirname, basename } from "path";

// handles the file after it has been uploaded (do something with the file after multer middleware has processed it)
export const fileController = {
	upload: (req: Request, res: Response, next: NextFunction) => {
		// Access the uploaded file via req.file
		if (!req.file) {
			return res.status(400).send("No file uploaded.");
		}

		try {
			// Create the file details data
			const fileDetails = {
				name: req.file.filename,
				path: join(req.file.destination, req.file.filename),
				size: req.file.size,
				type: req.file.mimetype,
				lastModifiedDate: new Date()
			};

			// init the session uploadFileList if it doesn't exist
			if (!req.session.uploadFileList) {
				req.session.uploadFileList = {};
			}

			// add the file details to the session uploadFileList
			req.session.uploadFileList[fileDetails.name] = fileDetails;
		} catch (error) {
			// An error occurred
			console.error("Error in adding the file to the list");
			next(error);
			return;
		}

		// File uploaded successfully
		console.log("File uploaded successfully.");
		next();
		return;
	},

	removeFile: (req: Request, res: Response) => {
		const uploadFileList = req.session.uploadFileList;
		const fileName = req.params.fileId;

		if (!uploadFileList || Object.keys(uploadFileList).length === 0) {
			res.status(404).send("No files uploaded yet.");
			return;
		}

		if (uploadFileList[fileName]) {
			delete uploadFileList[fileName];
			res.send({ message: "File removed", fileId: fileName });
		} else {
			res.status(404).send("File not found.");
		}
	},

	// package the last uploaded file details and send it to the next middleware
	packLastUploadFile: (
		req: Request,
		res: Response,
		next: NextFunction
	): void => {
		const lastFile = getLastUploadedFile(req.session.uploadFileList);
		if (lastFile) {
			res.locals.lastUploadedFile = lastFile;
			next();
		} else {
			res.json({ message: "No files uploaded yet." });
		}
	},

	// send the last uploaded file details to the client
	sendLastUploadFile: (req: Request, res: Response) => {
		const lastFile = getLastUploadedFile(req.session.uploadFileList);
		if (lastFile) {
			const directory = dirname(lastFile.path);
			const newFileName =
				basename(lastFile.path, extname(lastFile.path)) + ".geojson";
			const convertedCSVFile = join(directory, newFileName);
			res.sendFile(convertedCSVFile);
		} else {
			res.json({ message: "No files uploaded yet." });
		}
	},

	listAllFiles: (req: Request, res: Response) => {
		const uploadFileList = req.session.uploadFileList;
		if (!uploadFileList || Object.keys(uploadFileList).length === 0) {
			res.json({ message: "No files uploaded yet." });
			return;
		}
		res.json(uploadFileList);
	},

	getFile: (req: Request, res: Response) => {
		const uploadFileList = req.session.uploadFileList;
		const fileName = req.params.fileId;
		if (!uploadFileList || Object.keys(uploadFileList).length === 0) {
			res.status(404).send("No files uploaded yet.");
			return;
		}
		const file = uploadFileList[fileName];
		const directory = dirname(file.path);
		const newFileName =
			basename(file.path, extname(file.path)) + "_totalSamples.geojson";
		const convertedCSVFile = join(directory, newFileName);
		if (file) {
			res.sendFile(convertedCSVFile);
		} else {
			res.status(404).send("File not found.");
		}
	},
	
};
// download: (req: Request, res: Response) => {

function getLastUploadedFile(uploadFileList: any) {
	if (!uploadFileList || Object.keys(uploadFileList).length === 0) {
		return null;
	}
	const keys = Object.keys(uploadFileList);
	const lastFileKey = keys[keys.length - 1];
	return uploadFileList[lastFileKey];
}