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
            .map-title{
            position:relative;
            padding: 6px 8px;
            color: #4a4a4a;
            z-index: 400;
            font-size: 35px;
            text-align: center;
        }   
    </style>
</head>
<body>
    <div id="map"></div>
    <div class="map-title">Your Title Here</div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin=""></script>
    <script>
        const geoJsonData = ${JSON.stringify(geoJsonData)};

        const getColor = totalSamples =>  {
            return totalSamples > 28
                ? "#29394a"
                : totalSamples > 26
                ? "#304152"
                : totalSamples > 24
                ? "#38495b"
                : totalSamples > 22
                ? "#405264"
                : totalSamples > 20
                ? "#485a6d"
                : totalSamples > 18
                ? "#506376"
                : totalSamples > 16
                ? "#586b7f"
                : totalSamples > 14
                ? "#607488"
                : totalSamples > 12
                ? "#687c91"
                : totalSamples > 10
                ? "#70849a"
                : totalSamples > 8
                ? "#788da3"
                : totalSamples > 6
                ? "#8095ac"
                : totalSamples > 4
                ? "#889eb5"
                : totalSamples > 2
                ? "#90a6be"
                : totalSamples > 0
                ? "#98afc7"
                : "white"; // missing/0
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
