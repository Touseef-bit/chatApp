import cloudinaryPkg from 'cloudinary';
const { v2: cloudinary } = cloudinaryPkg;
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import appError from './appError.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chatApp',
    resource_type: 'auto', 
    public_id: (req, file) => `${file.fieldname}-${Date.now()}`,
  },
});

const dynamicFileFilter = (allowedMimeTypes) => (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new appError(`File type not allowed: ${file.mimetype}`, 400));
  }
};

const upload = ({
  allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'audio/webm',      
    'audio/mpeg',       
    'audio/wav'         
  ],
  maxSizeMB = 5,
  maxFiles = 1,
  isMultiple = false,
} = {}) => {
  const upload = multer({
    storage,
    fileFilter: dynamicFileFilter(allowedMimeTypes),
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });

  return isMultiple ? upload.array('files', maxFiles) : upload.single('file');
};

export default upload;
