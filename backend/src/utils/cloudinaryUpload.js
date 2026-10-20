import cloudinary from "../config/cloudinary.js";

// Upload a file held in memory. Returns Cloudinary's result (url, public_id, pages...)
export const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", ...options }, // PDFs are handled as "image" type, so they open in browsers
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// Delete a file. A failure is logged but never crashes the request
export const deleteFile = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (err) {
    console.error("Cloudinary delete failed:", err.message);
  }
};