import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import cloudinary from '../config/cloudinary.js';

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images and documents are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB limit
  fileFilter
});

// Helper function to handle file uploads to Cloudinary from memory buffer
export const handleFileUpload = async (file, folder = 'student_erp') => {
  if (!file) return null;

  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET) {
      
      // Convert buffer to base64 for Cloudinary upload
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      
      // Upload to Cloudinary directly from memory
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: folder,
        public_id: `${uuidv4()}-${Date.now()}`,
        resource_type: 'auto' // Auto-detect file type
      });
      
      return {
        url: result.secure_url,
        public_id: result.public_id,
        name: file.originalname
      };
    } else {
      // Cloudinary not configured - this shouldn't happen with memory storage
      console.warn('Cloudinary not configured. Files will not be saved.');
      return null;
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};

// Helper function for multiple files
export const handleMultipleFiles = async (files, folder = 'student_erp') => {
  if (!files || files.length === 0) return [];
  
  const uploadResults = [];
  
  for (const file of files) {
    const result = await handleFileUpload(file, folder);
    if (result) {
      uploadResults.push(result);
    }
  }
  
  return uploadResults;
};

export default upload;