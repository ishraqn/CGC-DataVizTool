import { Request, Response } from "express";
import { convertCSVToGeoJSON as convertCsvToGeoJsonUtil } from '../utils/csv2GeojsonUtils';

export const csvController = {
    convert2JSON: async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).send({ message: 'No file reached csv controller' });
        return; // Explicitly return to stop execution
    }else{

        const fileDetails = res.locals.lastUploadedFile as {
            name: string;
            path: string;
            size: number;
            type: string;
            lastModifiedDate: Date;
        };        

        if(!fileDetails){
            res.status(400).send({ message: 'No file uploaded' });
            return; // Explicitly return to stop execution
        }

        try {
            const geoJson = await convertCsvToGeoJsonUtil(fileDetails.path, fileDetails.name);
            res.json(geoJson);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            res.status(500).send({ message: 'Error processing CSV file', error: errorMessage });
            return; // Explicitly return to stop execution
        }
    }
    }
};
