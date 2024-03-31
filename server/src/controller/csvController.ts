import { NextFunction, Request, Response } from "express";
import { convertCSVToGeoJSON as convertCsvToGeoJsonUtil } from '../utils/csv2GeojsonUtils';
import { validateCsvRecords } from '../utils/inputValidationUtil';

export const csvController = {
    convert2JSON: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.file) {
            res.status(400).send({ message: 'No file reached csv controller' });
            return; 
        } else {
            const fileDetails = res.locals.lastUploadedFile as {
                name: string;
                path: string;
                size: number;
                type: string;
                lastModifiedDate: Date;
            };        

            if (!fileDetails) {
                res.status(400).send({ message: 'No file uploaded' });
                return; 
            }

            try {
                const validation = await validateCsvRecords(fileDetails.path);

                if (validation.hasErrors) {
                    res.status(422).json({
                        errors: validation.errors,
                        fileInfo: [fileDetails.path, fileDetails.name],
                    });
                }
                
                await convertCsvToGeoJsonUtil(fileDetails.path, fileDetails.name);

                next();
            } catch (err) {
                console.error("Error in csvController.convert2JSON: ", err);
                next(err);
                return; 
            }
        }
    },

    retryConversion: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        console.log("Received request body:", req.body);

        const [filePath, fileID] = req.body;

        if (!filePath || !fileID) {
            res.status(400).send({ message: "Missing File Details causing conversion to fail in retryConversion" });
            return; 
        }

        try {            
            await convertCsvToGeoJsonUtil(filePath, fileID);
            next();
        } catch (err) {
                console.error("Error in csvController.convert2JSON: ", err);
                next(err);
                return; 
        }
    }
};
