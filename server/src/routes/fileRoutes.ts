import { Router } from "express";
// import { fileController } from "../controller/fileController";
import { upload } from "../middleware/uploadMiddleware"; // multer middleware import goes here
import { fileController } from "../controller/fileController";
import { csvController } from "../controller/csvController";

const router = Router();

router.post("/upload", upload.single('csvFile'),fileController.upload, fileController.packLastUploadFile,csvController.convert2JSON); // route to upload a csv file, convert it to JSON and save it to local storage
router.get("/last-upload-file", fileController.sendLastUploadFile); // route to list the uploaded files
router.get("/all-uploaded-files", fileController.listAllFiles); // route to list all the uploaded files
router.get("/:fileId", fileController.getFile); // route to get a file
// router.post('/upload', upload.single('csvFile'), CSVToGeoJSONControl);
// router.get('/download', fileController.download); // route to download a file

export default router;
