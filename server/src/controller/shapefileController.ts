import { Request, Response } from "express";
import path from "path";
import { createShp2GeoJSON } from "../utils/shapefile2GeoJSON";

let lastModifiedFile: string = "";

export const shapefileController = {
    info: async (_req: Request, res: Response) => {
        try {
            const filePath = path.join(
                __dirname,
                `/data/2021-Agri-Preprocessed/default-${lastModifiedFile}.geojson`
            );
            res.download(filePath);
        } catch (error) {
            console.log(error);
        }
    },

    // convert: async (req: Request, res: Response) => {
    // },

    // function to convert the unprocessed shapefile within the data folder (for testing purposes only)
    dev_convert: async (_req: Request, res: Response) => {
        try {
            console.log("Converting shapefile...");
            console.log(__dirname);
            const startTime = new Date().getTime();
            const formattedDate = new Date().toISOString();
            lastModifiedFile = formattedDate;
            const filePath = path.resolve(
                __dirname,
                "../data/2021-Agri-Unprocessed/lcar000a21a_e.shp"
            );
            await createShp2GeoJSON(formattedDate, filePath);
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
    dev_download: async (_req: Request, res: Response) => {
        try {
            const filePath = path.resolve(
                __dirname,
                `../data/2021-Agri-Preprocessed/default-${lastModifiedFile}.geojson`
            );
            res.download(filePath);
        } catch (error) {
            console.log(error);
            res.status(500).send("Failed to download shapefile.");
        }
    },

    // download: async (req: Request, res: Response) => {
    // },
};

// const convertShapefile = async (shapefile: any): Promise<string> => {};

// export const downloadShapefile = async (req: Request, res: Response) => {}
