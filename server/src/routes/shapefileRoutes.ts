import { Router } from "express";
import { shapefileController } from "../controller/shapefileController";

const router = Router();

router.get("/info", shapefileController.info); // returns the default-simplified-10%.geojson file
router.get("/dev-convert", shapefileController.dev_convert); // converts the unprocessed shapefile within the data folder (for testing purposes only)
router.get("/dev-download", shapefileController.dev_download); // downloads the dev-converted shapefile (for testing purposes only) - must invoke dev-convert first and be in the same session
// router.get("/download", shapefileController.download);
// router.get("/upload", shapefileController.download);
// router.get("/convert", shapefileController.download);

export default router;
