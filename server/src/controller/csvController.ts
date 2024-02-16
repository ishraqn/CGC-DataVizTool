import { Request, Response } from "express";
import path from 'path';
import fs from 'fs/promises';
import { convertCSVToGeoJSON as convertCsvToGeoJsonUtil } from '../utils/csv2GeojsonUtils';

export const CSVToGeoJSONControl = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).send({ message: 'No file reached csv controller' });
        return; // Explicitly return to stop execution
    }else{

        const filePath = path.resolve(__dirname, '../data/uploads/temp', req.file.filename);

        try {
            const geoJson = await convertCsvToGeoJsonUtil(filePath);
            res.json(geoJson);

            try {
                await fs.unlink(filePath);
                console.log(`File ${filePath} deleted successfully.`);
            } catch (err) {
                console.error(`Error deleting file ${filePath}:`, err);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            res.status(500).send({ message: 'Error processing CSV file', error: errorMessage });
            return; // Explicitly return to stop execution
        }
    }
};
