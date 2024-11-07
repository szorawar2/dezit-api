// const AWS = require('aws-sdk');
// const fs = require('fs');
// const path = require('path');

import AWS from "aws-sdk";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Configure AWS with credentials
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-west-1",
});

const s3 = new AWS.S3();

// Updated s3UploadFile to accept file stream, filename, and path information
function s3UploadFile(fileStream, filename, directoryPath) {
  const params = {
    Bucket: "dezit-storage",
    Key: `base/udat/${directoryPath}/${filename}`, // Customize directory path as needed
    Body: fileStream,
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        console.error("File upload error:", err);
        reject(err);
      } else {
        console.log("File uploaded successfully:", data.Location);
        resolve(data.Location); // Return the file's S3 URL
      }
    });
  });
}

const s3Client = new S3Client({
  region: "us-west-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function s3DownloadFile(userName, fileId, res) {
  const params = {
    Bucket: "dezit-storage",
    Key: `base/udat/${userName}/${fileId}`,
  };

  try {
    const command = new GetObjectCommand(params);
    const { Body } = await s3Client.send(command);

    // Set headers for the download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(fileId)}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    // Pipe the S3 file stream directly to the response
    Body.pipe(res).on("error", (err) => {
      console.error("Error piping to response:", err);
      res.status(500).send("Error downloading file");
    });
    Body.on("end", () => {
      console.log(`File ${fileId} downloaded successfully`);
    });
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
}

//Creates data path fo user at the time of signup
async function s3CreateFolder(folderPath) {
  const params = {
    Bucket: "dezit-storage",
    Key: `base/udat/${folderPath}/`, // Folder path with trailing slash
    Body: "", // Empty content to create a zero-byte object
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    console.log(`Folder ${folderPath} created successfully in S3.`);
  } catch (err) {
    console.error("Error creating folder:", err);
  }
}

export { s3UploadFile, s3DownloadFile, s3CreateFolder };
