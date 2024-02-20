import {
    FeatureCollection,
    Point,
    Polygon,
    MultiPolygon,
    Feature,
} from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import fs from "fs";

export const aggregateSamplesInBorders = (
    pointsFilePath: string,
    bordersFilePath: string
): FeatureCollection => {
    const pointsGeoJSON: FeatureCollection = JSON.parse(
        fs.readFileSync(pointsFilePath, "utf-8")
    );
    const bordersGeoJSON: FeatureCollection = JSON.parse(
        fs.readFileSync(bordersFilePath, "utf-8")
    );

    bordersGeoJSON.features.forEach((border) => {
        let totalSamples = 0;

        if (
            border.geometry.type === "Polygon" ||
            border.geometry.type === "MultiPolygon"
        ) {
            pointsGeoJSON.features.forEach((point) => {
                if (point.geometry.type === "Point") {
                    const pointGeometry: Point = {
                        type: "Point",
                        coordinates: point.geometry.coordinates as [
                            number,
                            number
                        ],
                    };

                    if (
                        booleanPointInPolygon(
                            pointGeometry,
                            border as Feature<Polygon | MultiPolygon>
                        )
                    ) {
                        if (
                            point.properties &&
                            !isNaN(parseInt(point.properties.samples))
                        ) {
                            totalSamples += parseInt(point.properties.samples);
                        }
                    }
                }
            });

            border.properties = {
                ...border.properties,
                totalSamples: totalSamples,
            };
        }
    });

    return bordersGeoJSON;
};
