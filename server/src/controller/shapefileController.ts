// imports
import { Request, Response } from "express";
import { SessionData } from "express-session";
import { v5 as uuidV5 } from "uuid";
import path from "path";
import fs from "fs";
import { createShp2GeoJSON } from "../utils/shapefile2GeoJSONUtil";

// interface for the lastConversion session data to track of user session data
// used to track the user (session) and their info as needed (change if needed)
interface lastConversionSessionData extends SessionData {
    lastConversion?: { time: string; filePath: string };
}

export const shapefileController = {
      // function to get the default shapefile
    info: (_req: Request, res: Response) => {
        try {
            const filePath = path.resolve(
                __dirname,
                "..",
                "data",
                "default",
                "simplified",
                `default-simplified.geojson`
            );
            res.sendFile(filePath);
        } catch (error) {
            console.log(error);
        }
    },

    // function to take the uploaded shapefile or csv and convert and compress it
    // convert: async (req: Request, res: Response) => {
    // },

    // function for uploading the shapefile or csv
    //upload : async (req: Request, res: Response) => {
    // },

    // function to download the converted and compressed shapefile (only authorized users can download the file)
    // download: async (req: Request, res: Response) => {
    // },

    // function to convert the unprocessed shapefile within the data folder (for testing purposes only)
    // it assigns a unique ID related to the file that is being converted to avoid unauthorized access i.e the user in session
    dev_convert: async (req: Request, res: Response) => {
        try {
            console.log("Converting shapefile...");

            const startTime     = new Date().getTime();                         // start time of the conversion
            const formattedDate = new Date().toISOString().replace(/:/g, "-");  // formatted date for the file name
            const uniqueId      = uuidV5(formattedDate, uuidV5.URL);            // unique id for the file name
            const inputFilePath = path.resolve(
                  // file path of the default shapefile
                __dirname,
                "..",
                "data",
                "2021-Agri-Unprocessed",
                "lcar000a21a_e.shp"
            );
            const outputDir = path.resolve(
                  // directory path of the converted GeoJSON
                __dirname,
                "..",
                "data",
                "2021-Agri-Preprocessed"
            );
            const outputFilePath = path.resolve(
                  // file path of the converted GeoJSON
                __dirname,
                "..",
                "data",
                "2021-Agri-Preprocessed",
                `default--${uniqueId}-${formattedDate}.geojson`
            );

            try {
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                } else {
                    console.log("Output directory already exists.");
                }
            } catch (error) {
                console.error("Error in creating the directory: ", error);
            }

            const convertedFile = await createShp2GeoJSON(inputFilePath);  // convert the shapefile to GeoJSON
            if (convertedFile) {
                try {
                    fs.writeFile(
                        outputFilePath,
                        JSON.stringify(convertedFile, null, 2),
                        (err) => {
                            if (err) {
                                console.error(
                                    "Error in creating the file: ",
                                    err
                                );
                                throw new Error("Failed to convert shapefile.");
                            }
                        }
                    );
                    const sessionData = 
                        req.session as lastConversionSessionData;  // session data to track of user session data
                    sessionData.lastConversion = {
                        time    : formattedDate,
                        filePath: outputFilePath,
                    };
                } catch (error) {
                    console.error("Error in creating the file: ", error);
                }
            } else {
                throw new Error("Failed to convert shapefile.");
            }

            const endTime = new Date().getTime();

            console.log(`Conversion took ${endTime - startTime}ms`);
            res.status(200).send(
                "Converted shapefile Successfully, check the data folder."
            );
        } catch (error) {
            console.error("Conversion failed.", error);
            res.status(500).send("Failed to convert shapefile.");
        }
    },

    // function to download the dev-converted shapefile (for testing purposes only)
    // only authorized users can download the file i.e the user who converted the file
    dev_download: async (req: Request, res: Response) => {
        try {
            const sessionData = req.session as lastConversionSessionData;

            // Check if there's a last conversion record in the session
            if (!sessionData.lastConversion) {
                return res
                    .status(403)
                    .send("No shapefile has been converted yet.");
            }

            const filePath = sessionData.lastConversion.filePath;

            if (fs.existsSync(filePath)) {
                return res.download(filePath, (err) => {
                    if (err) {
                        console.error("Error sending file:", err);
                        if (!res.headersSent) {
                            res.status(500).send(
                                "Error in downloading the file."
                            );
                        }
                    }
                });
            } else {
                return res.status(404).send("Converted file not found.");
            }
        } catch (error) {
            console.error("Failed to download shapefile:", error);
            res.status(500).send("Failed to download shapefile.");
        }
    },
};
