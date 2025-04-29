import express from 'express';
import * as statusHistoryController from '../controllers/statusHistory.controller.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Base routes
router
  .route('/')
  .get(protect, authorize('admin', 'editor'), statusHistoryController.getAllStatusHistory)
  .post(protect, authorize('admin', 'editor'), statusHistoryController.createStatusHistory);

router
  .route('/:id')
  .get(protect, authorize('admin', 'editor'), statusHistoryController.getStatusHistory)
  .put(protect, authorize('admin'), statusHistoryController.updateStatusHistory)
  .delete(protect, authorize('admin'), statusHistoryController.deleteStatusHistory);

// Article-specific routes
router
  .route('/articles/:articleId/status-history')
  .get(protect, authorize('admin', 'editor'), statusHistoryController.getStatusHistoryByArticle);

export default router; 