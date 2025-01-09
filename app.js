import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors";
import dbConnection from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/userRouter.js";
import timelineRouter from "./routes/timelineRouter.js";
import messageRouter from "./routes/messageRouter.js";
import skillRouter from "./routes/skillRouter.js";
import softwareApplicationRouter from "./routes/softwareApplicationRouter.js";
import projectRouter from "./routes/projectRouter.js";
import ErrorHandler from "./middlewares/ErrorHander.js"; // Corrected file name

const app = express();
dotenv.config({ path: "./config/config.env" });

// Verify required environment variables
if (!process.env.MONGO_URI || !process.env.PORTFOLIO_URL || !process.env.DASHBOARD_URL) {
  console.error("Missing required environment variables.");
  process.exit(1); // Exit with failure
}

// CORS configuration with credentials support
app.use(
  cors({
    origin: (origin, callback) => {
      // Define the allowed origins
      const allowedOrigins = [
        "https://vipul-attri.netlify.app/", // Portfolio URL
        "https://vipul-portfolio-dashboard.netlify.app/", // Dashboard URL
      ];

      if (allowedOrigins.includes(origin) || !origin) {
        // Allow requests from the specified origins or if the origin is not defined (e.g., Postman)
        callback(null, true);
      } else {
        // Reject requests from other origins
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

// Pre-flight handling for OPTIONS requests
app.options("*", cors());

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database connection
dbConnection();

// File upload configuration
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/", // Ensure this directory exists
  })
);

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/timeline", timelineRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/skill", skillRouter);
app.use("/api/v1/softwareapplication", softwareApplicationRouter);
app.use("/api/v1/project", projectRouter);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof ErrorHandler) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  } else {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Export the app
export default app;
