import { Router } from "express";
import { geoController } from "../controller/geoController";

const router = Router();

router.get("/geo-aggregate-data", geoController.getAggregatedData); // route to get the aggregated data

export default router;
