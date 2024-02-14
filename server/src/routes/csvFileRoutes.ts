import express from 'express';
import { convertCSV } from '../controller/csvController'; // Import csv controller
import { upload } from '../middleware/uploadMiddleware'; // Import the upload middleware

const router = express.Router();

// Define the POST route for CSV conversion, using the upload middleware to handle file uploads
router.post('/convert-csv', upload.single('file'), convertCSV);

export default router;
