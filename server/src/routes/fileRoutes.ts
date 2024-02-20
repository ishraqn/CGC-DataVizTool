import { Router } from "express";
// import { fileController } from "../controller/fileController";
import { upload } from "../middleware/uploadMiddleware"; // multer middleware import goes here
import { fileController } from "../controller/fileController";
import { csvController } from "../controller/csvController";

const router = Router();

router.post("/upload", upload.single('csvFile'),fileController.upload, fileController.lastUploadFile,csvController.convert2JSON); // route to upload a csv file, convert it to JSON and save it to local storage
router.get("/last-upload-file", fileController.lastUploadFile); // route to list the uploaded files
// router.post('/upload', upload.single('csvFile'), CSVToGeoJSONControl);
// router.get('/download', fileController.download); // route to download a file

export default router;
