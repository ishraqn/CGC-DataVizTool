import { GeoJsonObject } from "geojson";
import { RGBColor } from "react-color";

export function generateColorGradient(
    numSteps: number = 10,
    startColor: string = 'rgb(152, 175, 199)',
    endColor: string = 'null'
): string[] {
    // Parse the start and end colors
    const startRGB: number[] = parseRGB(startColor);

    // Calculate the end color based on the start color values
    if(endColor == 'null' || endColor == 'rgb(NaN, NaN, NaN)'){
        endColor = 'rgb(';
            for (let i = 0; i < startRGB.length; i++) {
                if (startRGB[i] > 153) {
                    endColor += (startRGB[i] - 153).toString();
                } else {
                    endColor += (startRGB[i] + 153).toString();
                }
                if (i < startRGB.length - 1) {
                    endColor += ', ';
                }
            }
        endColor += ')';
    }
    
    // Parse the end color
    const endRGB: number[] = parseRGB(endColor);
    
    // Calculate the step size for each color channel 
    const stepSize: number[] = [
        (endRGB[0] - startRGB[0]) / numSteps,
        (endRGB[1] - startRGB[1]) / numSteps,
        (endRGB[2] - startRGB[2]) / numSteps
    ];

    // Generate the gradient colors
    const gradientColors: string[] = [];
    
    // Push white color for 0
    gradientColors.push('rgb(255, 255, 255)');

    // Generate the gradient colors for other steps
    for (let i = 1; i <= numSteps; i++) {
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

export function getColor(
    value: number,
    values: number[],
    numSteps: number = 10
): number {
    let binIndex;
    if (value === 0) {
        binIndex = 0;
    } else {
        --numSteps;
        // Determine the value range excluding 0
        const filteredValues = values.filter(val => val !== 0);
        const minValue = Math.min(...filteredValues);
        const maxValue = Math.max(...filteredValues);
        const valueRange = maxValue - minValue;
        // Determine the bin size
        const binSize = valueRange / numSteps;

        // Determine which bin the value falls into
        binIndex = Math.floor((value - minValue) / binSize) + 1;
    }
    return binIndex;
}

export function extractValuesFromGeoJSON(geoJsonData: GeoJsonObject): number[] {
    const tempValues: number[] = [];
    (geoJsonData as any).features.forEach((feature: any) => {
        tempValues.push(feature.properties.totalSamples as number);
    });
    return tempValues;
}

export function convertColorToString(color: RGBColor): string {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

export function hexToRgb(hex: string | any[]) {
    let r = 0, g = 0, b = 0;

    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    }
    else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    return `rgb(${r}, ${g}, ${b})`;
}