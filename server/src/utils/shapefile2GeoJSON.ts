import * as shapefile from "shapefile";
import proj4 from "proj4";
import { writeFileSync } from "fs";
import path from "path";

const sourceProjection =
    'PROJCS["NAD83_Statistics_Canada_Lambert",GEOGCS["GCS_North_American_1983",DATUM["D_North_American_1983",SPHEROID["Geodetic_Reference_System_of_1980",6378137,298.2572221008916]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Lambert_Conformal_Conic"],PARAMETER["standard_parallel_1",49],PARAMETER["standard_parallel_2",77],PARAMETER["latitude_of_origin",63.390675],PARAMETER["central_meridian",-91.86666666666666],PARAMETER["false_easting",6200000],PARAMETER["false_northing",3000000],UNIT["Meter",1]]'; // Full String from .prj file
const destinationProjection = "EPSG:4326"; // WGS 84

async function createShp2GeoJSON(formattedDate: string, shapefilePath: string) {
    try {
        const outputFilePath: string = `../data/2021-Agri-Preprocessed/default-${formattedDate}.geojson`;
        const source = await shapefile.open(shapefilePath);
        const features = [];
        let result = await source.read();

        while (!result.done) {
            if (
                result.value &&
                result.value.geometry &&
                result.value.properties
            ) {
                const transformedGeometry = transformGeometry(
                    result.value.geometry
                );
                features.push({
                    type: "Feature",
                    properties: result.value.properties,
                    geometry: transformedGeometry,
                });
            }

            result = await source.read();
        }

        const geoJSON = {
            type: "FeatureCollection",
            features: features,
        };

        writeFileSync(
            path.resolve(__dirname, outputFilePath),
            JSON.stringify(geoJSON, null, 2)
        );
        console.log(`GeoJSON file created on ${outputFilePath}`);
    } catch (error) {
        console.error((error as Error).message);
        throw new Error("Failed to convert shapefile to GeoJSON.");
    }
}

function transformGeometry(geometry: any): any {
    const transformer = proj4(sourceProjection, destinationProjection).forward;

    const transformCoord = (coord: [number, number]): [number, number] => {
        const [x, y] = transformer(coord);
        if (!isFinite(x) || !isFinite(y)) {
            throw new Error(
                `Invalid coordinate transformation resulting in non-finite numbers: ${coord}`
            );
        }
        return [x, y];
    };

    const deepMapCoordinates = (coords: any): any => {
        if (typeof coords[0] === "number") {
            return transformCoord(coords);
        } else {
            return coords.map(deepMapCoordinates);
        }
    };

    return {
        ...geometry,
        coordinates: deepMapCoordinates(geometry.coordinates),
    };
}

export { createShp2GeoJSON };
