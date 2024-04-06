import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import csvtojson from "csvtojson";

async function convertCSVToGeoJSON(csvFilePath: string, filename: string) {
	try {
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
			return JSON.stringify(geoJSON, null, 2);
		} catch (error) {
			console.error("Failed to write GeoJSON file:", error);
		}
	} catch (error) {
		console.error("Failed to convert CSV to GeoJSON:", error);
	}
}

export { convertCSVToGeoJSON };
