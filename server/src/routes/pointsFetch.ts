const express = require("express");
const path = require("path");
const app = express();
import {Response} from "express";

app.get('/api/vi/geojson', (res: Response) => {
    // Corrected file path with 'v1' instead of 'vi'
    const filePath = path.join(__dirname, 'api/v1/data-folder/default/temp/convertcsv.geojson');
    res.sendFile(filePath);
});
