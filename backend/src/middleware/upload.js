import multer from "multer";
import ApiError from "../utils/ApiError.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB (Cloudinary's free plan limit)

const upload = multer({
  storage: multer.memoryStorage(), // keep the file in memory, then send it to Cloudinary
  limits: { fileSize: MAX_FILE_SIZE, files: 2 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "pdf") {
      return file.mimetype === "application/pdf"
        ? cb(null, true)
        : cb(new ApiError(400, "Book file must be a PDF"));
    }
    if (file.fieldname === "cover") {
      return ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
        ? cb(null, true)
        : cb(new ApiError(400, "Cover must be a JPG, PNG or WEBP image"));
    }
    cb(new ApiError(400, `Unexpected file field: ${file.fieldname}`));
  },
});

// Accepts one "cover" image and one "pdf" file
export const uploadBookFiles = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);