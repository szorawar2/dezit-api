import express from "express";
import busboy from "busboy";

import { uploadFile } from "../fs.js"; // Updated import

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
    const local_filename = `${userId}_${messageIndex}_${filename.filename}`;

    console.log("Uploading:", local_filename);

    try {
      // Pass the file stream and filename to uploadFile
      const result = await uploadFile(file, local_filename, userName);

      console.log("Local file path:", result);
      res
        .status(200)
        .json({ message: "Upload complete", localFileId: local_filename });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  bb.on("finish", async () => {});

  return req.pipe(bb);
});

export default router;
