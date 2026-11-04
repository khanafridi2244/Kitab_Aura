export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

// Cloudinary resizes images on the fly. thumb(url, 640) gives a 640px wide 16:9 version
export const thumb = (url, width = 640) =>
  url && url.includes("/upload/") ? url.replace("/upload/", `/upload/c_fill,ar_16:9,w_${width},f_auto,q_auto/`) : url;