import express from "express";
import { 
  uploadArticleFile, 
  getArticleFiles, 
  deleteArticleFile, 
  updateFileStatus,
  getArticleFileContent
} from "../../controllers/articleFile.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const router = express.Router();

// Upload file cho bài báo - nhận URL từ Cloudinary đã được upload từ frontend
router.post("/:articleId", verifyToken, uploadArticleFile);

// Lấy danh sách file của bài báo
router.get("/:articleId", verifyToken, getArticleFiles);

// Xóa file bài báo
router.delete("/:fileId", verifyToken, deleteArticleFile);

// Cập nhật trạng thái file
router.patch("/:fileId/status", verifyToken, updateFileStatus);

// Lấy nội dung file (trả về URL để frontend tải về)
router.get("/:fileId/content", verifyToken, getArticleFileContent);

export default router;