import express from "express";
import busboy from "busboy";
import fs from "fs";
import path from "path";

import { googleUploadFile } from "../google.js";

const router = express.Router();

let userId;
let messageIndex;

// gets file prefix values before saving
router.post("/upload_id", (req, res) => {
  userId = req.body.userID;
  messageIndex = req.body.message_index;
  res.status(200).json({ message: "upload_id updated" });
});

router.post("/upload", (req, res) => {
  const bb = busboy({ headers: req.headers });
  let result;

  bb.on("file", async (fieldname, file, filename, encoding, mimetype) => {
    console.log("Uploading:", filename);
    // const uploadPath = path.join(
    //   "..",
    //   "uploads",
    //   `${userId}_${messageIndex}_${filename.filename}`
    // );

    // const writeStream = fs.createWriteStream(uploadPath);
    // file.pipe(writeStream);

    try {
      result = await googleUploadFile(
        file,
        userId,
        messageIndex,
        filename.filename,
        mimetype
      );
      console.log("Drive file id:", result);
      res
        .status(200)
        .json({ message: "Upload complete", file_driveId: result });
    } catch (error) {
      console.error("Error uploading file:", error);
      return res.status(500).json({ error: "Upload failed" });
    }
  });

  bb.on("finish", async () => {});

  return req.pipe(bb);
});

export default router;
