import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { mkdirp } from "mkdirp";

// Load environment variables from .env file
dotenv.config();

// Set the base directory for storing files locally
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_DIR = path.join(__dirname, "./uploads");

// Ensure the base directory exists
mkdirp.sync(BASE_DIR);

/**
 * Uploads a file to local storage.
 *
 * @param {ReadableStream} fileStream - The file stream to upload.
 * @param {string} filename - The name/id of the file to be saved in local storage.
 * @param {string} directoryPath - User directory inside the local storage where the file will be saved.
 * @returns {Promise<string>} Resolves with the file's local path if upload is successful.
 */
function uploadFile(fileStream, filename, directoryPath) {
  // Define the target directory and file path
  const userDirectory = path.join(BASE_DIR, directoryPath);

  // Ensure the user directory exists
  mkdirp.sync(userDirectory);

  // Define the path where the file will be stored
  const filePath = path.join(userDirectory, filename);

  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);

    fileStream
      .pipe(writeStream)
      .on("finish", () => {
        console.log("File uploaded successfully:", filePath);
        resolve(filePath); // Return the local file path
      })
      .on("error", (err) => {
        console.error("File upload error:", err);
        reject(err);
      });
  });
}

/**
 * Downloads a file from local storage and streams it to the response.
 *
 * @param {string} userName - The username for structuring the file path.
 * @param {string} fileId - The unique name of the file to download.
 * @param {Object} res - The HTTP response object for piping the download.
 * @returns {Promise<void>} Resolves when the download is complete.
 */
async function downloadFile(userName, fileId, res) {
  const filePath = path.join(BASE_DIR, userName, fileId);

  console.log("File path:", filePath);

  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Set headers for the download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(fileId)}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    // Pipe the file stream to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res).on("error", (err) => {
      console.error("Error piping to response:", err);
      res.status(500).send("Error downloading file");
    });

    fileStream.on("end", () => {
      console.log(`File ${fileId} downloaded successfully`);
    });
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
}

/**
 * Creates a folder for the specified user in local storage.
 * Useful for setting up user directories.
 *
 * @param {string} folderName - The folder named according to the username.
 * @returns {Promise<void>} Resolves when the folder is successfully created.
 */
async function createFolder(folderName) {
  const userDirectory = path.join(BASE_DIR, folderName);

  try {
    // Ensure the folder is created
    await mkdirp(userDirectory);
    console.log(`Folder ${folderName} created successfully in local storage.`);
  } catch (err) {
    console.error("Error creating folder:", err);
  }
}

/**
 * Deletes a file from local storage.
 *
 * @param {string} filePath - The relative path to the file to be deleted.
 * @returns {Promise<void>} Resolves when the file is deleted.
 */
async function deleteFile(filePath) {
  try {
    const fullFilePath = path.join(BASE_DIR, filePath);
    if (fs.existsSync(fullFilePath)) {
      fs.unlinkSync(fullFilePath);
      console.log(`File '${filePath}' deleted successfully.`);
    } else {
      console.log(`File '${filePath}' not found.`);
    }
  } catch (err) {
    console.error("Error deleting file:", err);
  }
}

/**
 * Deletes a folder and all its contents from local storage.
 *
 * @param {string} folderPath - The folder path to be deleted.
 * @returns {Promise<void>} Resolves when the folder and its contents are deleted.
 */
async function deleteFolder(folderPath) {
  try {
    const folderFullPath = path.join(BASE_DIR, folderPath);

    if (fs.existsSync(folderFullPath)) {
      // Recursively remove the folder and its contents
      fs.rmdirSync(folderFullPath, { recursive: true });
      console.log(`Folder '${folderPath}' deleted successfully.`);
    } else {
      console.log(`Folder '${folderPath}' not found.`);
    }
  } catch (err) {
    console.error("Error deleting folder:", err);
  }
}

export { uploadFile, downloadFile, createFolder, deleteFile, deleteFolder };
