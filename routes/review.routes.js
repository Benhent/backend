import express from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Base routes
router
  .route('/')
  .get(protect, authorize('admin', 'editor'), reviewController.getAllReviews)
  .post(protect, authorize('editor'), reviewController.createReview);

router
  .route('/:id')
  .get(protect, authorize('admin', 'editor', 'reviewer'), reviewController.getReview)
  .put(protect, authorize('admin', 'editor', 'reviewer'), reviewController.updateReview)
  .delete(protect, authorize('admin', 'editor'), reviewController.deleteReview);

// Review action routes
router
  .route('/:id/accept')
  .put(protect, authorize('reviewer'), reviewController.acceptReview);

router
  .route('/:id/decline')
  .put(protect, authorize('reviewer'), reviewController.declineReview);

router
  .route('/:id/complete')
  .put(protect, authorize('reviewer'), reviewController.completeReview);

router
  .route('/:id/remind')
  .put(protect, authorize('editor'), reviewController.sendReminder);

export default router; 