import express from 'express';
import {
  signup,
  verifyEmail,
  resendVerification,
  login,
  logout,
  forgotPassword,
  resetPassword,
  checkAuth,
  changePassword,
  updateProfile
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { handleUploadErrors } from '../middlewares/uploadImage.js';

const router = express.Router();

// Public routes - no authentication required
router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes - authentication required
router.use(verifyToken); // Apply verifyToken middleware to all routes below
router.post('/logout', logout);
router.get('/check', checkAuth);
router.put('/change-password', changePassword);
router.put('/profile', handleUploadErrors, updateProfile);

export default router;