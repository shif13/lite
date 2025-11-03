import { uploadImageToCloudinary, uploadMultipleImages } from './cloudinary';

// Upload property images (uses Cloudinary instead of Firebase Storage)
export const uploadPropertyImages = async (images) => {
  return await uploadMultipleImages(images);
};

// Upload single image
export const uploadImage = async (image) => {
  return await uploadImageToCloudinary(image);
};