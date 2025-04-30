import AWS from "aws-sdk";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Configures AWS SDK credentials using environment variables.
 * Access key and secret access key are pulled from `.env` file.
 */
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-west-1",
});

const s3 = new AWS.S3();

/**
 * Uploads a file to an AWS S3 bucket.
 *
 * @param {ReadableStream} fileStream - The file stream to upload.
 * @param {string} filename - The name/id of the file to be saved in S3.
 * @param {string} directoryPath - User directory inside the S3 bucket where the file will be saved.
 * @returns {Promise<string>} Resolves with the file's S3 URL if upload is successful.
 */
function s3UploadFile(fileStream, filename, directoryPath) {
  const params = {
    Bucket: "dezit-storage",
    Key: `base/udat/${directoryPath}/${filename}`, // base/udat/user-directory/unique-filename
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

/**
 * Downloads a file from an AWS S3 bucket and streams it to the response.
 *
 * @param {string} userName - The username for structuring the file path.
 * @param {string} fileId - The unique name of the file to download.
 * @param {Object} res - The HTTP response object for piping the download.
 * @returns {Promise<void>} Resolves when the download is complete.
 */
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

/**
 * Creates a folder in the specified path within an S3 bucket.
 * Useful for setting up user directories.
 *
 * @param {string} folderName - The folder named according to the username.
 * @returns {Promise<void>} Resolves when the folder is successfully created.
 */
async function s3CreateFolder(folderName) {
  const params = {
    Bucket: "dezit-storage",
    Key: `base/udat/${folderName}/`, // Folder path with trailing slash
    Body: "", // Empty content to create a zero-byte object
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    console.log(`Folder ${folderName} created successfully in S3.`);
  } catch (err) {
    console.error("Error creating folder:", err);
  }
}

/*
--
*/
async function deleteFile(filePath) {
  const deleteParams = {
    Bucket: "dezit-storage",
    Key: `base/udat/${filePath}`,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log(`File '${filePath}' deleted successfully.`);
  } catch (err) {
    console.error("Error deleting file:", err);
  }
}

/*
--
*/
async function deleteFolder(folderPath) {
  const listParams = {
    Bucket: "dezit-storage",
    Prefix: folderPath,
  };

  try {
    // 1. List all objects with the specified prefix
    const listedObjects = await s3Client.send(
      new ListObjectsV2Command(listParams)
    );

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      console.log("Folder is already empty or does not exist.");
      return;
    }

    // 2. Create a batch of delete requests
    const deleteParams = {
      Bucket: "dezit-storage",
      Delete: { Objects: [] },
    };

    listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
    });

    // 3. Delete all objects in the folder
    await s3Client.send(new DeleteObjectsCommand(deleteParams));
    console.log(`Folder '${folderPath}' deleted successfully.`);
  } catch (err) {
    console.error("Error deleting folder:", err);
  }
}

export {
  s3UploadFile,
  s3DownloadFile,
  s3CreateFolder,
  deleteFile,
  deleteFolder,
};
