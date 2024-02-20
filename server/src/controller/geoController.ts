import { Request, Response } from "express";
import { aggregateSamplesInBorders } from "../utils/geoSpatialJoinUtil";
import { join, dirname, basename, extname, resolve } from "path";

export const geoController = {
    getAggregatedData: async (req: Request, res: Response): Promise<void> => {
        if (
            !req.session.uploadFileList ||
            Object.keys(req.session.uploadFileList).length === 0
        ) {
            res.status(404).json({ message: "No files uploaded yet." });
            return;
        }

        const keys = Object.keys(req.session.uploadFileList);
        const lastFileKey = keys[keys.length - 1];
        const lastFile = req.session.uploadFileList[lastFileKey];

        const directory = dirname(lastFile.path);
        const newGeoJSONFileName =
            basename(lastFile.path, extname(lastFile.path)) + ".geojson";
        const processedGeoJSONFilePath = join(directory, newGeoJSONFileName);
        const processedCSVFilePath = resolve(
            __dirname,
            "..",
            "data",
            "default",
            "simplified",
            "default-simplified.geojson"
        );

        try {
            const aggregatedData = await aggregateSamplesInBorders(
                processedGeoJSONFilePath,
                processedCSVFilePath
            );
            res.json(aggregatedData);
        } catch (error) {
            console.error("Error in getAggregatedData:", error);
            res.status(500).send({ error: "Internal Server Error" });
        }
    },
};
