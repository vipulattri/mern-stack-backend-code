import app from "./app.js";
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const PORT = process.env.PORT || 5000; // Default to port 5000 if not specified in .env
app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
