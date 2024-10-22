import express from "express";
import path from "path";
import { googleDownloadFile } from "../google.js";

const router = express.Router();

router.get("/load_file", async (req, res) => {
  const { fileId } = req.query;
  // const fileDetail = `${userID}_${message_index}_${fileName}`;
  // const filePath = path.resolve("../uploads", fileDetail);
  console.log(fileId);

  if (!fileId) {
    return res.status(400).json({ error: "File ID is required" });
  }

  // Call the googleDownloadFile function and pass the response object
  await googleDownloadFile(fileId, res);
});

export default router;
