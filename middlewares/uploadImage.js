import multer from 'multer';
import { CloudinaryStorage } from '@fluidjs/multer-cloudinary';
import cloudinary from '../service/cloudinary.config.js';

// Cấu hình Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    format: async (req, file) => {
      // Lấy định dạng từ file gốc hoặc chuyển đổi thành định dạng mong muốn
      const extension = file.mimetype.split('/')[1];
      return extension === 'jpeg' ? 'jpg' : extension;
    },
    public_id: (req, file) => {
      // Bạn có thể đặt tên file tùy chỉnh ở đây
      return `user-${req.user._id}-${Date.now()}`;
    },
    transformation: [{ width: 256, height: 256, crop: 'fill' }]
  }
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
  // Chỉ chấp nhận các loại hình ảnh
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Khởi tạo middleware multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: fileFilter
}).single('avatar');

// Middleware xử lý upload
export const handleAvatarUpload = (req, res, next) => {
  upload(req, res, function (err) {
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