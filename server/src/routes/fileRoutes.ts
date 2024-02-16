import { Router } from "express";
import { upload } from "../middleware/uploadMiddleware"; // Assuming this handles file upload errors
import { CSVToGeoJSONControl } from '../controller/csvController'; // Function for CSV to GeoJSON conversion

const router = Router();

// Route for uploading and converting a CSV file
router.post('/upload', upload.single('csvFile'), CSVToGeoJSONControl);

export default router;