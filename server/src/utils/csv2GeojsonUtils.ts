import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import csvtojson from "csvtojson";

const createDirectoryIfNotExists = (directory: string) => {
	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory, { recursive: true });
	}
};

async function convertCSVToGeoJSON(csvFilePath: string, filename: string) {
	try {
		const geojsonDir: string = path.resolve(
			__dirname,
			"..",
			"data",
			"uploads",
			"temp"
		);

		// const fileName: string = path.basename(csvFilePath, path.extname(csvFilePath));
		// hardcoded for testing points displaying after conversion

		const geojsonFileName: string =
			path.basename(filename, path.extname(filename)) + ".geojson";
		const geojsonFilePath: string = path.resolve(geojsonDir, geojsonFileName);

		createDirectoryIfNotExists(geojsonDir);

		const csvToJson: any[] = await csvtojson().fromFile(csvFilePath);
		const features: any[] = csvToJson
			.map((item: any) => {
				const latitude: number = parseFloat(item.lat);
				const longitude: number = parseFloat(item.long);
				return {
					type: "Feature",
					properties: item,
					geometry: {
						type: "Point",
						coordinates: [longitude, latitude],
					},
				};
			})
			.filter((feature: any) => feature !== null);

		const geoJSON = {
			type: "FeatureCollection",
			features: features,
		};

		try {
			await fsp.writeFile(geojsonFilePath, JSON.stringify(geoJSON, null, 2));
		} catch (error) {
			console.error("Failed to write GeoJSON file:", error);
		}
	} catch (error) {
		console.error("Failed to convert CSV to GeoJSON:", error);
	}
}

export { convertCSVToGeoJSON };
