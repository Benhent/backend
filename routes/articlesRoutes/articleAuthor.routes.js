import express from 'express';
import * as articleAuthorController from '../../controllers/articleAuthor.controller.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Base routes
router
  .route('/')
  .get(protect, authorize('admin', 'editor'), articleAuthorController.getAllArticleAuthors)
  .post(protect, authorize('admin', 'editor', 'author'), articleAuthorController.createArticleAuthor);

router
  .route('/:id')
  .get(protect, authorize('admin', 'editor', 'author'), articleAuthorController.getArticleAuthor)
  .put(protect, authorize('admin', 'editor', 'author'), articleAuthorController.updateArticleAuthor)
  .delete(protect, authorize('admin', 'editor'), articleAuthorController.deleteArticleAuthor);

// Article-specific routes
router
  .route('/articles/:articleId/authors')
  .get(protect, authorize('admin', 'editor', 'author'), articleAuthorController.getArticleAuthorsByArticle);

export default router; 