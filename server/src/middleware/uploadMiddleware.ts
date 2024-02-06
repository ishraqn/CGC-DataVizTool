import multer from "multer";
import path from "path";

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, path.resolve(__dirname, "..", "data","upload","temp")); // Save files to the 'uploads/temp' directory
    },
    filename: function (_req, file, cb) {
        // Generate filename based on current date, session ID, and original filename
        const currentDate = new Date().toISOString().slice(0, 10);
        const sessionId = _req.session.id;
        const filename = `${sessionId}_${currentDate}_${file.originalname}`;
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
            cb(new Error('Only .csv files are allowed!'));
        }
    }
});
