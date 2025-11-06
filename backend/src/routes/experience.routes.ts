import express from 'express';
import { checkAuth } from '../middleware/auth.middleware.js';
import {
  createExperience,
  getExperiences,
  getExperienceById,
  updateExperience,
  deleteExperience,
  getMyExperiences
} from '../controllers/experience.controller.js';

const router = express.Router();

// Public routes
router.get('/', getExperiences);
router.get('/:experienceId', getExperienceById);

// Protected routes for guides
router.post('/', checkAuth, createExperience);
router.put('/:experienceId', checkAuth, updateExperience);
router.delete('/:experienceId', checkAuth, deleteExperience);
router.get('/guide/my-experiences', checkAuth, getMyExperiences);

export default router;