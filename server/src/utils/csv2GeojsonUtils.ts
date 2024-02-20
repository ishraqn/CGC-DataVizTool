import fs from 'fs';
import path from 'path';
import csvtojson from 'csvtojson';

const createDirectoryIfNotExists = (directory: string) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

async function convertCSVToGeoJSON(csvFilePath: string) {
    try {
        const geojsonDir: string = path.resolve(__dirname, "..", "data", "csv_conversion");
        
        // const fileName: string = path.basename(csvFilePath, path.extname(csvFilePath));
        // hardcoded for testing points displaying after conversion

        const geojsonFileName: string = `points.geojson`;
        const geojsonFilePath: string = path.resolve(geojsonDir, geojsonFileName);

        createDirectoryIfNotExists(geojsonDir);

        const csvToJson: any[] = await csvtojson().fromFile(csvFilePath);
        const features: any[] = csvToJson.map((item: any) => {
        const latitude: number = parseFloat(item.latitude);
        const longitude: number = parseFloat(item.longitude);
            return {
                type: "Feature",
                properties: item,
                geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                },
            };
        }).filter((feature: any) => feature !== null);

        const geoJSON = {
            type: "FeatureCollection",
            features: features,
        };

        fs.writeFile(geojsonFilePath, JSON.stringify(geoJSON, null, 2), (err) => {
            if (err) throw err;
            console.log(`GeoJSON file saved to ${geojsonFilePath}`);
        });
    } catch (error) {
        console.error("Failed to convert CSV to GeoJSON:", error);
    }
}

export { convertCSVToGeoJSON };