// server/index.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import loginRouter from "./routes/login.js";
import updMessRouter from "./routes/updatemessages.js";
import uploadRouter from "./routes/upload.js";
import loadFileRouter from "./routes/load_file.js";
import miscRouter from "./routes/misc.js";
import signupRouter from "./routes/signup.js";

const uploadPath = "../uploads/";

const app = express();
const PORT = process.env.SERVER || 5000;

// Middleware
app.use(cors()); // Allow React to communicate with Node
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data (text fields in form)

app.use(
  loginRouter, // (/login)
  signupRouter, // (/signup)
  updMessRouter, // (/updatemessages)
  uploadRouter, // (/upload, /upload_id)
  loadFileRouter, // (/load_file)
  miscRouter // (/users)
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
