import * as puppeteer from "puppeteer";
import fs from "fs/promises";

const renderMap = async (filePath: string): Promise<Buffer> => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on("console", (consoleMessage) =>
        console.log("PAGE LOG:", consoleMessage.text())
    );

    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });

    let geoJsonData;
    try {
        const data = await fs.readFile(filePath, "utf-8");
        geoJsonData = JSON.parse(data);
        console.log("geoJsonData:", geoJsonData);
    } catch (error) {
        console.error(
            `Failed to read or parse the GeoJSON file at ${filePath}:`,
            error
        );
        await browser.close();
        throw error;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Server-side Map Rendering</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""/>
    <style>
        #map { height: 100vh; width: 100vw; }
        .leaflet-container {
            position: absolute;
            top: 10px;
            right: 10px;
            bottom: 10px;
            left: 10px;
            border-radius: 10px;
            background-color: #e0e7e7;
          }          
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin=""></script>
    <script>
        const geoJsonData = ${JSON.stringify(geoJsonData)};

        const getColor = totalSamples => {
            return totalSamples > 1000 ? "#122336" : 
                   totalSamples > 900  ? "#12273d" : 
                   totalSamples > 800  ? "#112a45" : 
                   totalSamples > 700  ? "#13385e" : 
                   totalSamples > 600  ? "#13385e" : 
                   totalSamples > 500  ? "#1c4978" : 
                   totalSamples > 400  ? "#204b78" : 
                   totalSamples > 300  ? "#264f7a" : 
                   totalSamples > 250  ? "#2b517a" :
                   totalSamples > 200  ? "#2f537a" : 
                   totalSamples > 150  ? "#33577d" :
                   totalSamples > 100  ? "#3c638c" : 
                   totalSamples > 80   ? "#42668c" :
                   totalSamples > 60   ? "#4a6c91" : 
                   totalSamples > 40   ? "#537294" : 
                   totalSamples > 20   ? "#597694" : 
                   totalSamples > 10   ? "#7091b3" : 
                   totalSamples > 5    ? "#7895b3" : 
                   totalSamples > 2    ? "#8299b0" : 
                   totalSamples > 0    ? "#98afc7" : 
                   "white"; 
        };

        const geoJsonStyle = feature => ({
            fillColor: getColor(feature.properties.totalSamples),
            weight: 2,
            color: "#46554F",
            fillOpacity: 1,
        });

        const initMap = () => {
            const map = L.map('map', {
                center: [74.14008387440462, -96.767578125],
                zoom: 3,
                zoomControl: false,
            });

            L.geoJson(geoJsonData, {style: geoJsonStyle}).addTo(map);

            map.fitBounds(-146.77734375000003,20.797201434307,-46.75781250000001,86.77799674310461);
        };

        document.addEventListener('DOMContentLoaded', initMap);
    </script>
</body>
</html>
    `;

    await page.setContent(htmlContent, {
        waitUntil: "networkidle0",
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const screenshotBuffer = await page.screenshot({ fullPage: true });

    await browser.close();
    return screenshotBuffer;
};

export { renderMap };
