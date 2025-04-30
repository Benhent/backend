import express from "express";
import {
  createArticle,
  getArticles,
  deleteArticle,
  changeArticleStatus,
  // addInternalNote
} from "../../controllers/article.controller.js";
import {verifyToken} from "../../middlewares/verifyToken.js"
import {authorizeRoles} from "../../middlewares/isAdmin.js"

const router = express.Router();

// Public routes
router.get("/articles", getArticles);

// Protected routes
router.post("/articles", verifyToken, createArticle);
router.delete("/articles/:id", verifyToken, deleteArticle);
router.put("/articles/:id/status", verifyToken, authorizeRoles("editor", "admin"), changeArticleStatus);
// router.post("/articles/:id/internal-notes", verifyToken, authorizeRoles("editor", "admin"), addInternalNote);

export default router;