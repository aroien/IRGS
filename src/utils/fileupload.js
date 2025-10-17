// src/utils/fileUpload.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export const uploadFile = async (file, folder = 'courses/thumbnails') => {
  try {
    // Validate file
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file');
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Please select a valid image file (JPEG, PNG, WebP, GIF)');
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new Error('File size should be less than 2MB');
    }

    // Create safe file name
    const fileExtension = file.name.split('.').pop();
    const safeFileName = `thumb_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `${folder}/${safeFileName}`);

    // Upload with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: 'admin',
        originalName: file.name
      }
    };

    // Upload file
    const snapshot = await uploadBytes(storageRef, file, metadata);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
    
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

// Fallback placeholder image
export const getPlaceholderImage = (text = 'Course Image', width = 400, height = 300) => {
  return `https://via.placeholder.com/${width}x${height}/4F46E5/FFFFFF?text=${encodeURIComponent(text)}`;
};