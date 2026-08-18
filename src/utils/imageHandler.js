// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || 'https://rakshit-ai-conditioners-backend.onrender.com/api/admin';



const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.115:9000/api/admin';




export const SERVER_URL =
  import.meta.env.VITE_API_ORIGIN ||
  API_BASE_URL.replace(/\/api\/admin\/?$/, '').replace(/\/api\/?$/, '');

const isBlobOrDataUrl = (value) =>
  value.startsWith('data:') || value.startsWith('blob:');

const extractUploadPath = (value) => {
  const match = String(value).match(/(\/uploads\/[^?#]+)/i);
  return match ? match[1] : '';
};

/** Normalize stored paths to /uploads/... for form fields and API payloads */
export const normalizeImagePath = (imagePath) => {
  if (!imagePath) return '';
  if (isBlobOrDataUrl(imagePath)) return imagePath;

  const uploadPath = extractUploadPath(imagePath);
  if (uploadPath) return uploadPath;

  if (imagePath.startsWith('/')) return imagePath;
  return `/${imagePath}`;
};

/** Resolve image/media paths for display in admin (handles /uploads/... and full URLs) */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (isBlobOrDataUrl(imagePath)) return imagePath;

  const uploadPath = extractUploadPath(imagePath);
  if (uploadPath) {
    return `${SERVER_URL}${uploadPath}`;
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const normalized = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${SERVER_URL}${normalized}`;
};
