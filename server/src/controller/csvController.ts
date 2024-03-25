import { NextFunction, Request, Response } from "express";
import { convertCSVToGeoJSON as convertCsvToGeoJsonUtil } from '../utils/csv2GeojsonUtils';
// import {validateCsvRecords} from '../utils/inputValidation';

export const csvController = {
    convert2JSON: async (req: Request, res: Response, next: NextFunction) => {
        if (!req.file) {
            return next(new Error('No file reached csv controller'));
        }

        const fileDetails = res.locals.lastUploadedFile as {
            name: string;
            path: string;
            size: number;
            type: string;
            lastModifiedDate: Date;
        };

        if (!fileDetails) {
            return next(new Error('No file uploaded'));
        }

        // const validation = await validateCsvRecords(fileDetails.path);
        // if (validation.hasErrors) {
        //     return res.status(422).json({
        //         message: 'Validation errors found in CSV file',
        //         errors: validation.errors
        //     });
        // }else{
            try {
                await convertCsvToGeoJsonUtil(fileDetails.path, fileDetails.name);
                next(); // Proceed to next middleware
            } catch (err) {
                console.error("Error in csvController.convert2JSON:", err);
                return next(err); // Pass error to error-handling middleware
            }
       // }
    },

    continueConversion: async (req: Request, res: Response, next: NextFunction) => {
        const fileDetails = res.locals.lastUploadedFile as {
            name: string;
            path: string;
            size: number;
            type: string;
            lastModifiedDate: Date;
        };
    
        const processAsIs = req.body.processAsIs === true; // Check if the flag is true
    
        if (!fileDetails) {
            return next(new Error('No file to continue conversion.'));
        }
    
        if (processAsIs) {
            console.log('File will be processed as it is.');
            try{
                // Proceed with the usual conversion process
                await convertCsvToGeoJsonUtil(fileDetails.path, fileDetails.name);
                // Call next to proceed to the next middleware, if any
                next();
            } catch (err) {
                console.error("Error in continueConversion:", err);
                next(err); // Pass the error to the next error handling middleware
            }
        }
    }
};
