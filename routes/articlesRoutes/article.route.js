import express from "express";
import {
  createArticle,
  getArticles,
  deleteArticle,
  changeArticleStatus,
  addInternalNote
} from "../controllers/article.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/articles", ...createArticle);
router.get("/articles", ...getArticles);
router.delete("/articles/:id", ...deleteArticle);
router.put("/articles/:id/status", verifyToken, authorizeRoles("editor", "admin"), changeArticleStatus);
router.post("/articles/:id/internal-notes", verifyToken, authorizeRoles("editor", "admin"), addInternalNote);

export default router;