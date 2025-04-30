import express from 'express';
import {
  createArticleAuthor,
  getAllArticleAuthors,
  getArticleAuthor,
  updateArticleAuthor,
  deleteArticleAuthor,
  getArticleAuthorsByArticle
} from '../../controllers/articleAuthor.controller.js';
import {verifyToken} from '../../middlewares/verifyToken.js';
import {authorizeRoles} from '../../middlewares/isAdmin.js';

const router = express.Router();

// Public routes
router.get('/articles/:articleId/authors', getArticleAuthorsByArticle);


// Protected routes
router.post('/article-authors', verifyToken, authorizeRoles('admin', 'editor', 'author'), createArticleAuthor);
router.get('/article-authors', verifyToken, getAllArticleAuthors);
router.get('/article-authors/:id', verifyToken, getArticleAuthor);
router.put('/article-authors/:id', verifyToken, authorizeRoles('admin', 'editor', 'author'), updateArticleAuthor);
router.delete('/article-authors/:id', verifyToken, authorizeRoles('admin', 'editor'), deleteArticleAuthor);

export default router; 