import express from "express";
import busboy from "busboy";

import { s3UploadFile } from "../s3.js";

const router = express.Router();

let userId;
let messageIndex;
let userName;

// gets file prefix values before saving
router.post("/upload_id", async (req, res) => {
  userId = req.body.userID;
  messageIndex = req.body.message_index;
  userName = req.body.userName;

  res.status(200).json({ message: "upload_id updated" });
});

router.post("/upload", async (req, res) => {
  const bb = busboy({ headers: req.headers });

  bb.on("file", async (fieldname, file, filename) => {
    const s3_filename = `${userId}_${messageIndex}_${filename.filename}`;

    console.log("Uploading:", s3_filename);

    try {
      // Pass the file stream and filename to s3UploadFile
      const result = await s3UploadFile(file, s3_filename, userName);

      console.log("S3 file URL:", result);
      res
        .status(200)
        .json({ message: "Upload complete", s3FileId: s3_filename });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  bb.on("finish", async () => {});

  return req.pipe(bb);
});

export default router;
