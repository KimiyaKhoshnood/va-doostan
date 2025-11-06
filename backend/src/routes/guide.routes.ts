import express from 'express';
import { checkAuth } from '../middleware/auth.middleware.js';
import {
  applyAsExperienceGuide,
  getGuideProfile,
  updateGuideProfile,
  getPublicGuideProfile
} from '../controllers/guide.controller.js';

const router = express.Router();

// Apply to become an experience guide (protected route)
router.post('/apply', checkAuth, applyAsExperienceGuide);

// Get own guide profile (protected route)
router.get('/profile', checkAuth, getGuideProfile);

// Update guide profile (protected route)
router.put('/profile', checkAuth, updateGuideProfile);

// Get public guide profile (public route)
router.get('/profile/:guideId', getPublicGuideProfile);

export default router;