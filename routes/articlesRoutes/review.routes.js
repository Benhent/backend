import express from 'express';
import * as reviewController from '../../controllers/review.controller.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Base routes
router.route('/')
router.get(protect, authorize('admin', 'editor'), reviewController.getAllReviews)
router.post(protect, authorize('admin', 'editor'), reviewController.createReview);

// Multiple reviews route
router.route('/multiple')
router.post(protect, authorize('admin', 'editor'), reviewController.createMultipleReviews);

// Single review routes
router.route('/:id')
router.get(protect, authorize('admin', 'editor', 'reviewer'), reviewController.getReview)
router.put(protect, authorize('admin', 'editor'), reviewController.updateReview)
router.delete(protect, authorize('admin', 'editor'), reviewController.deleteReview);

// Review actions
router.route('/:id/accept')
router.post(protect, authorize('reviewer'), reviewController.acceptReview);

router.route('/:id/decline')
router.post(protect, authorize('reviewer'), reviewController.declineReview);

router.route('/:id/complete')
router.post(protect, authorize('reviewer'), reviewController.completeReview);

router.route('/:id/reminder')
router.post(protect, authorize('admin', 'editor'), reviewController.sendReminder);

export default router; 