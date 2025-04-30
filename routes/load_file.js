import express from "express";

import { downloadFile } from "../fs.js";

const router = express.Router();

router.get("/load_file", async (req, res) => {
  const { fileId, userName } = req.query;

  console.log(fileId);

  if (!fileId) {
    return res.status(400).json({ error: "File ID is required" });
  }

  // Call the downloadFile function and pass the response object
  await downloadFile(userName, fileId, res);
});

export default router;
