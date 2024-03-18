import {
    FeatureCollection,
    Point,
    Polygon,
    MultiPolygon,
    Feature,
} from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import fs from "fs";

export const aggregateSamplesInBorders = async (
    pointsFilePath: string,
    bordersFilePath: string
): Promise<FeatureCollection> => {
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
				let matched = false;

                if (point.geometry.type === "Point") {
                    const pointGeometry: Point = {
                        type: "Point",
                        coordinates: point.geometry.coordinates as [
                            number,
                            number
                        ],
                    };

                    matched =
                        booleanPointInPolygon(
                            pointGeometry,
                            border as Feature<Polygon | MultiPolygon>
                        )
					}

				if (
						!matched &&
						point.properties?.CARUID &&
						border.properties?.CARUID &&
						point.properties.CARUID === border.properties.CARUID
					) {
						matched = true;
					}

                if (!matched) {
                        const province = point.properties?.Province || point.properties?.province;
                        const cropDistrict = point.properties?.CropDistrict || point.properties?.CD;
                        const careNameNumberMatch = border.properties?.CARENAME?.match(/\d+$/);
                        const careNameNumber = careNameNumberMatch ? careNameNumberMatch[0] : null;
                
                        if (province?.toUpperCase() === border.properties?.PRABBR && cropDistrict === careNameNumber) {
                            matched = true;
                        }
                }

				if (matched) {
						const samples = parseInt(
							point.properties?.samples ||
								point.properties?.Samples ||
								point.properties?.sample ||
								point.properties?.Sample ||
								"0"
						);
						if (!isNaN(samples)) {
							totalSamples += samples;
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
