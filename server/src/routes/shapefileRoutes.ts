import { Router } from "express";
import { shapefileController } from "../controller/shapefileController";

const router = Router();

router.get("/info", shapefileController.info);
router.get("/dev-convert", shapefileController.dev_convert);
router.get("/dev-download", shapefileController.dev_download);
// router.get("/download", shapefileController.download);
// router.get("/convert", shapefileController.download);

export default router;
