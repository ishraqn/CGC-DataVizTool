import { Router } from "express";
import { developerController } from "../controller/developerController";

const router = Router();

router.get("/", developerController.init); // default homepage route - view count and cookie test

export default router;
