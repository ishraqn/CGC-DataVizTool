import * as puppeteer from "puppeteer";
import fs from "fs/promises";

const renderMap = async (
    filePath: string,
    fillColors: undefined,
    visibleFeatures: undefined,
    title: string,
    legendLabels: undefined,
    tileLayer: boolean
): Promise<Buffer> => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setBypassCSP(true);

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
            background-color:  #ffffff;
        }          
            .map-title{
            position:relative;
            padding: 6px 8px;
            color: #4a4a4a;
            z-index: 400;
            font-size: 35px;
            text-align: center;
        }
        .legend{
            background-color: rgba(255, 255, 255, 0.9);
            padding: 10px;
            border: 2px solid #ccc;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <div class="map-title">${title}</div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin=""></script>
    <script>
    const geoJsonData = ${JSON.stringify(geoJsonData)};
    const featureColors = ${JSON.stringify(fillColors)};
    const featureVisibility = ${JSON.stringify(visibleFeatures)};
    const legendLabels = ${JSON.stringify(legendLabels)};
    const tileLayer = ${tileLayer};

    const geoJsonStyle = (feature) => {
        if (!featureVisibility[feature.properties.CARUID]) {
            return {
                fillOpacity: 0,
                weight: 0,
                color: "white",
                fillColor: featureColors[feature.properties.CARUID],
            };
        } else {
            return {
                fillColor: featureColors[feature.properties.CARUID],
                weight: 0.7,
                color: "black",
                fillOpacity: tileLayer ? 0.4 : 1,
            };
        }
    };

    const initMap = () => {
        const map = L.map('map', {
            zoom: 1,
            zoomControl: false,
        });

        if (tileLayer) {
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            }).addTo(map);
        }

        const geoJSONLayer = L.geoJson(geoJsonData, {
            style: geoJsonStyle,
            filter: (feature) => {
                return featureVisibility[feature.properties.CARUID];
            }
        }).addTo(map);

        const bounds = geoJSONLayer.getBounds();

        if (bounds.isValid()) {
            map.fitBounds(bounds);
        }
        else{
            map.fitBounds(-146.77734375000003,20.797201434307,-46.75781250000001,86.77799674310461);
        }

        if (legendLabels && legendLabels.length > 0) {
            const legend = L.control({ position: 'bottomright' });
            legend.onAdd = function () {
                const div = L.DomUtil.create('div', 'legend');
                let labels = [];
                legendLabels.forEach((label, index) => {
                    if (label.upper === "") {
                        labels.push(
                            '<div style="display: flex; align-items: center;">' +
                            '<i style="background:' + label.color + '; width:18px; height:18px; display:inline-block; margin-right:4px; border: 1px solid #ccc; border-radius: 4px;"></i> ' +
                            '<span style="color: black; font-weight: bold;">' + label.lower + ' </span>' +
                            '</div>'
                        );
                    } else {
                        labels.push(
                            '<div style="display: flex; align-items: center;">' +
                            '<i style="background:' + label.color + '; width:18px; height:18px; display:inline-block; margin-right:4px; border: 1px solid #ccc; border-radius: 4px;"></i> ' +
                            '<span style="color: black; font-weight: bold;">' + label.lower + ' &ndash; ' + label.upper + '</span>' +
                            '</div>'
                        );
                    }
                });            
                div.innerHTML = labels.join('<br>');
                return div;
            };
            legend.addTo(map);
        }
        
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
