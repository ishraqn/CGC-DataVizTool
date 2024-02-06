import { Router } from "express";
// import { fileController } from "../controller/fileController";
import { upload } from "../middleware/uploadMiddleware"; // multer middleware import goes here

const router = Router();

router.post("/upload", upload.single('csvFile')/*, fileController.upload*/); // route to upload a file
// router.get('/download', fileController.download); // route to download a file

export default router;
