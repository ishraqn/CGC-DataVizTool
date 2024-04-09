import { NextFunction, Request, Response } from "express";
import {resolve} from 'path';
import { renderMap } from "../utils/renderMapUtil";

export const mapController = {
    renderMap : async(req: Request, res: Response, next: NextFunction) => {
        try {
            const title = req.body.title;
            let filePath = req.body.filePath;
            const fillColors = req.body.fillColors;
            const visibleFeatures = req.body.visibileFeatures;

            if (Object.keys (filePath).length === 0) {
                filePath = resolve(__dirname, "..", "data", "default", "simplified", "default-simplified.geojson");
            }
            else{
                filePath = filePath.replace(".csv","_totalSamples.geojson");
            }
            const screenshotBuffer = await renderMap(filePath, fillColors, visibleFeatures, title);
            res.type("image/png").send(screenshotBuffer);
        } catch (error) {
            console.error("Error rendering map: ");
            next(error);
        }
    }
};