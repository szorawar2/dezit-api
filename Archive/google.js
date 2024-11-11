import { google } from "googleapis";
import path from "path";
import fs from "fs";
import mime from "mime-types";

import pool from "../db.js";

let ACCESS_TOKEN = "";
let REFRESH_TOKEN = "";

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

const filePath = path.join("..", "uploads", "1_0_upload test.txt");

// Helper function to refresh the access token if needed
oauth2Client.on("tokens", async (tokens) => {
  if (tokens.access_token) {
    console.log("New Access Token:", tokens.access_token);
    ACCESS_TOKEN = tokens.access_token; // Store the new access token if required

    try {
      await pool.query("UPDATE accesstoken SET acc_token = ? WHERE id = ?", [
        ACCESS_TOKEN,
        1,
      ]);
    } catch (error) {
      console.log("Update failed:", error.message);
    }
  }
});

async function googleUploadFile(
  fileStream,
  userID,
  messageIndex,
  fileName,
  mimeType
) {
  const [dbResultA] = await pool.query(
    "SELECT acc_token FROM accesstoken WHERE id = 1"
  );
  ACCESS_TOKEN = dbResultA[0].acc_token;

  const [dbResultB] = await pool.query(
    "SELECT acc_token FROM accesstoken WHERE id = 2"
  );
  REFRESH_TOKEN = dbResultB[0].acc_token;

  oauth2Client.setCredentials({
    access_token: ACCESS_TOKEN,
    refresh_token: REFRESH_TOKEN,
  });

  try {
    const response = await drive.files.create({
      requestBody: {
        name: `${userID}_${messageIndex}_${fileName}`,
        mimeType: mimeType,
      },
      media: {
        mimeType: mimeType,
        body: fileStream,
      },
    });

    console.log("Uploaded file details:", response.data);

    //return file id for referencing in database
    return response.data.id;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("Access token expired, refreshing...");
      await oauth2Client.getAccessToken(); // Refresh the token if it expired
      return googleUploadFile(); // Retry the upload
    } else {
      console.error("Upload Failed:", error.message);
    }
  }
}

async function googleDownloadFile(fileId, res) {
  // const destPath = path.join("..", "downloads", "downloaded_file.txt");

  const [dbResultA] = await pool.query(
    "SELECT acc_token FROM accesstoken WHERE id = 1"
  );
  ACCESS_TOKEN = dbResultA[0].acc_token;

  const [dbResultB] = await pool.query(
    "SELECT acc_token FROM accesstoken WHERE id = 2"
  );
  REFRESH_TOKEN = dbResultB[0].acc_token;

  oauth2Client.setCredentials({
    access_token: ACCESS_TOKEN,
    refresh_token: REFRESH_TOKEN,
  });

  try {
    //const dest = fs.createWriteStream(destPath); // Create write stream to destination file

    const response = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "stream" }
    );

    // Get file metadata to determine its name and MIME type
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: "name, mimeType",
    });
    const fileName = fileMetadata.data.name || "downloaded_file";
    const mimeType =
      fileMetadata.data.mimeType ||
      mime.lookup(fileName) ||
      "application/octet-stream";

    console.log(fileName, mimeType);

    // Set the response headers to prompt a download
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`); // Change filename accordingly
    res.setHeader("Content-Type", mimeType);
    //res.setHeader("Content-Type", "application/octet-stream"); // Set the content type appropriately

    response.data
      .on("end", () => {
        console.log(`Downloaded complete`);
      })
      .on("error", (err) => {
        console.error("Error downloading file:", err);
      })
      .pipe(res); // Send the data directly to the client
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("Access token expired, refreshing...");
      await oauth2Client.getAccessToken(); // Refresh the token if it expired
      return googleDownloadFile(); // Retry the upload
    } else {
      console.error("Download Failed:", error.message);
    }
  }
}

export { googleUploadFile, googleDownloadFile };
