import multer from 'multer';
import path from 'path';
import cloudinary from '../config/cloudinaryConfig.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Cấu hình lưu trữ cho Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars', // thư mục lưu ảnh trên Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 256, height: 256, crop: 'fill' }] // resize và crop ảnh
  }
});

// Hàm kiểm tra loại file
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Only JPEG, JPG, PNG and GIF files are allowed.'), false);
};

// Khởi tạo middleware multer
export const uploadAvatar = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 }, // giới hạn 2MB
  fileFilter: fileFilter
}).single('avatar'); // 'avatar' là tên trường form-data

// Middleware xử lý lỗi upload
export const handleUploadErrors = (req, res, next) => {
  uploadAvatar(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Lỗi multer
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      // Lỗi khác
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    // Không có lỗi, tiếp tục
    next();
  });
};