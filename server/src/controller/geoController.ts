import { NextFunction, Request, Response } from "express";
import { aggregateSamplesInBorders } from "../utils/geoSpatialJoinUtil";
import { join, dirname, basename, extname, resolve } from "path";
import fs from "fs";

export const geoController = {
	getAggregatedData: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
			const outputFilePath = join(
				directory,
				basename(lastFile.path, extname(lastFile.path)) +
					"_totalSamples.geojson"
			);
			fs.writeFileSync(outputFilePath, JSON.stringify(aggregatedData));
			res.json(aggregatedData);
		} catch (error) {
			console.error("Error in getAggregatedData:");
			next(error);
		}
	},
};
