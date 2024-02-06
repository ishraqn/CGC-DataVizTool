import multer from "multer";
import path from "path";
import { v5 as uuidV5 } from 'uuid';

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        const destinationPath = path.resolve(__dirname, "..", "data", "uploads", "temp");
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
    // Define file filter to allow only specific file types
    fileFilter: (_req, file, cb) => {
        const allowedFileTypes = ['.csv'];
        const extname = path.extname(file.originalname).toLowerCase();

        if (allowedFileTypes.includes(extname)) {
            cb(null, true);
        } else {
            const errorMessage = 'Only .csv files are allowed!';
            cb(new Error(errorMessage));
        }
    }
});