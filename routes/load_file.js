import express from "express";

import { s3DownloadFile } from "../s3.js";

const router = express.Router();

router.get("/load_file", async (req, res) => {
  const { fileId, userName } = req.query;

  console.log(fileId);

  if (!fileId) {
    return res.status(400).json({ error: "File ID is required" });
  }

  // Call the googleDownloadFile function and pass the response object
  await s3DownloadFile(userName, fileId, res);
});

export default router;
