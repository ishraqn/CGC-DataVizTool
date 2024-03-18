import { NextFunction, Request, Response } from "express";
import { convertCSVToGeoJSON as convertCsvToGeoJsonUtil } from '../utils/csv2GeojsonUtils';

export const csvController = {
    convert2JSON: async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        res.status(400).send({ message: 'No file reached csv controller' });
        return; 
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
            return; 
        }

        try {
            await convertCsvToGeoJsonUtil(fileDetails.path, fileDetails.name);
            next();
        } catch (err) {
            console.error("Error in csvController.convert2JSON: ");
            next(err);
            return; 
        }
    }
    }
};
