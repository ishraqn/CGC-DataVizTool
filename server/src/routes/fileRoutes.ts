import { Router } from "express";
import { upload } from "../middleware/uploadMiddleware"; // Your multer middleware for handling file uploads
import { handleCSVToGeoJSONConversion } from '../controller/csvController'; // The function that handles CSV to GeoJSON conversion

const router = Router();

// Route for uploading and converting a CSV file
router.post('/upload', upload.single('csvFile'), (req, res) => {
    if (req.file) {
        // If a file is uploaded, proceed to convert it
       handleCSVToGeoJSONConversion(req, res);
    } else {
        // If no file is uploaded, send an appropriate response
        res.status(400).send({ message: 'No file uploaded' });
    }
});

export default router;