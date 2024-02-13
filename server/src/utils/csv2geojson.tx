import csvtojson from "csvtojson";
import * as fs from "fs";
import * as path from "path";

const destinationProjection = "EPSG:4326"; // Assuming WGS 84 for the output projection

async function convertCSVToGeoJSON(csvFilePath: string) {
  try {
    const tempDir = "/Users/ajay/TestParsing/result"; // Get the system's temporary directory
    const fileName = path.basename(csvFilePath, path.extname(csvFilePath)); // Extract filename without extension
    const geojsonFilePath = path.join(tempDir, fileName + ".geojson"); // Construct the full path for the GeoJSON file

    const jsonObj = await csvtojson().fromFile(csvFilePath);

    const features = jsonObj.map((item) => {
      const latitude = parseFloat(item.latitude);
      const longitude = parseFloat(item.longitude);

      //Forming thegeojson data as needed.
      return {
        type: "Feature",
        properties: item, // All CSV columns become feature properties
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      };
    }).filter((feature) => feature !== null); // Remove nulls from invalid rows

    const geoJSON = {
      type: "FeatureCollection",
      features: features,
    };

    // Ensure the directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(geojsonFilePath, JSON.stringify(geoJSON, null, 2));
    console.log(`GeoJSON file saved to ${geojsonFilePath}`);
  } catch (error) {
    console.error("Failed to convert CSV to GeoJSON:", error);
  }
}

export { convertCSVToGeoJSON };