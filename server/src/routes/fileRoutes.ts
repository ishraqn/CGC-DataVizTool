import { Router } from "express";
// import { fileController } from "../controller/fileController";
import { upload } from "../middleware/uploadMiddleware"; // multer middleware import goes here
import { fileController } from "../controller/fileController";
import { csvController } from "../controller/csvController";
import { geoController } from "../controller/geoController";

const router = Router();

router.post("/upload", upload.single('csvFile'),fileController.upload, fileController.packLastUploadFile,csvController.convert2JSON, geoController.getAggregatedData); // route to upload a csv file, convert it to JSON and save it to local storage
router.get("/last-upload-file", fileController.sendLastUploadFile); // route to list the uploaded files
router.get("/all-uploaded-files", fileController.listAllFiles); // route to list all the uploaded files
router.get("/:fileId", fileController.getFile); // route to get a file
router.post("/remove/:fileId", fileController.removeFile); // route to remove a file
router.post("/retry-conversion", csvController.retryConversion, fileController.sendLastUploadFile, geoController.getAggregatedData);
router.get("/csv-errors", (req, res) => {
    // Retrieve errors using type assertion
    const csvErrors = (req.session as any).csvErrors;
    res.json(csvErrors || []);
});
// router.post('/upload', upload.single('csvFile'), CSVToGeoJSONControl);
// router.get('/download', fileController.download); // route to download a file

export default router;