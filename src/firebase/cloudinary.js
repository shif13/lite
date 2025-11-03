const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
const UPLOAD_PRESET = 'real_estate'; // You'll create this in Cloudinary dashboard

// Upload single image to Cloudinary
export const uploadImageToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.secure_url) {
      return { success: true, url: data.secure_url };
    } else {
      return { success: false, error: 'Upload failed' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload multiple images
export const uploadMultipleImages = async (files) => {
  try {
    const uploadPromises = Array.from(files).map(file => 
      uploadImageToCloudinary(file)
    );

    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results
      .filter(result => result.success)
      .map(result => result.url);

    return { 
      success: true, 
      urls: successfulUploads,
      count: successfulUploads.length 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};