import multer from "multer";
import path from "path";
import fs from "fs";
import { v5 as uuidV5 } from 'uuid';
// import { Request, Response } from "express";

// Function to create a directory if it doesn't exist
const createDirectoryIfNotExists = (directory: string) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        const destinationPath = path.resolve(__dirname, "..", "data", "uploads", "temp");
        createDirectoryIfNotExists(destinationPath);
        cb(null, destinationPath); // Save files to the 'uploads/temp' directory
    },
    filename: function (_req, file, cb) {
        // Generate filename based on current date, session ID, and original filename
        const formattedDate = new Date().toISOString().replace(/:/g, "-");  // formatted date for the file name
        const uniqueId = uuidV5(formattedDate, uuidV5.URL); 
        const sanitizedFileName = file.originalname.replace(/[^\w\s.-]/gi, ''); // Remove any special characters
        const filename = `${uniqueId}_${sanitizedFileName}`;
        cb(null, filename);
    }
});

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 },
    // Define file filter to allow only specific file types
    fileFilter: (_req, file, cb) => {
        const allowedFileTypes = ['text/csv'];

        if (allowedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            const errorMessage = `Only files of the following types are allowed: ${allowedFileTypes.join(', ')}`;
            cb(new Error(errorMessage));
        } 
    }
});