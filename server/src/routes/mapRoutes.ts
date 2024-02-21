import { Router } from "express";
import { mapController } from "../controller/mapController";

const router = Router();

router.post("/render-map", mapController.renderMap);

export default router;