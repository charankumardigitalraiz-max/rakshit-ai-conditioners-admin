export const SERVER_URL = 'https://rakshit-ai-conditioners-backend.onrender.com';
// export const SERVER_URL = 'http://localhost:9000';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  return `${SERVER_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
