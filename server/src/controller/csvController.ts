import { Request, Response } from 'express';
import {convertCSVToGeoJSON} from "../utils/csv2GeojsonUtils"

export const convertCSV = async (req: Request, res: Response) => {
    // Check if the file was uploaded
    if (!req.file) {
        return res.status(400).send('No CSV file uploaded.');
    }

    try {
        const filePath = req.file.path; // Get the path to the uploaded file
        // Use filePath as input to your conversion logic
        const geoJSON = await convertCSVToGeoJSON(filePath); // Convert CSV to GeoJSON using your utility function

        // Send back the conversion result or a success message
        res.json({
            message: 'CSV successfully converted to GeoJSON',
            data: geoJSON // Send the conversion result
        });
    } catch (error) {
        console.error('Error converting CSV to GeoJSON:', error);
        res.status(500).send('Failed to convert CSV file to GeoJSON.');
    }
};