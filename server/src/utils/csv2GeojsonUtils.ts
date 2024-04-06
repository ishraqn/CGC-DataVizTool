import csvtojson from "csvtojson";

async function convertCSVToGeoJSON(csvFilePath: string, _filename: string) {
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

		return geoJSON;
	} catch (error) {
		console.error("Failed to convert CSV to GeoJSON:", error);
		return null;
	}
}

export { convertCSVToGeoJSON };
