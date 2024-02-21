import { GeoJsonObject } from "geojson";

export function generateColorGradient(numSteps: number = 10, startColor: string = 'rgb(171, 15, 52)', endColor: string = 'rgb(169,169,169)'): string[] {
    // Parse the start and end colors
    const startRGB: number[] = parseRGB(startColor);
    const endRGB: number[] = parseRGB(endColor);
    console.log(startColor);

    // Calculate the step size for each color channel
    const stepSize: number[] = [
        (endRGB[0] - startRGB[0]) / (numSteps - 1),
        (endRGB[1] - startRGB[1]) / (numSteps - 1),
        (endRGB[2] - startRGB[2]) / (numSteps - 1)
    ];

    // Generate the gradient colors
    const gradientColors: string[] = [];
    for (let i = 0; i < numSteps; i++) {
        const r: number = Math.round(startRGB[0] + stepSize[0] * i);
        const g: number = Math.round(startRGB[1] + stepSize[1] * i);
        const b: number = Math.round(startRGB[2] + stepSize[2] * i);
        gradientColors.push(`rgb(${r}, ${g}, ${b})`);
    }
    return gradientColors;
}

// Helper function to parse RGB color string into an array of numbers
function parseRGB(rgb: string): number[] {
    const regex = /rgb\((\d+), (\d+), (\d+)\)/;
    const matches = rgb.match(regex);
    if (matches && matches.length === 4) {
        return [parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3])];
    } else {
        throw new Error('Invalid RGB color format');
    }
}

export function getColor(value: number, values: number[], numSteps: number = 10): number {
    // Determine the value range
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;

    // Determine the bin size
    const binSize = valueRange / numSteps+1;

    // Determine which bin the value falls into
    const binIndex = Math.floor((value - minValue) / binSize);
    return binIndex;
}

export function extractValuesFromGeoJSON(geoJsonData: GeoJsonObject): number[]{
    const tempValues: number[] = [];
    (geoJsonData as any).features.forEach((feature: any) => {
        tempValues.push(feature.properties.totalSamples as number);
       });
    return tempValues;
}

