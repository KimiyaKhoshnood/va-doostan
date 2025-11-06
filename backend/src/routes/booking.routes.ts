import express from 'express';
import { checkAuth } from '../middleware/auth.middleware.js';
import {
  bookExperience,
  getMyBookings,
  getGuideBookings,
  updateBookingStatus,
  cancelBooking,
  addReview
} from '../controllers/booking.controller.js';

const router = express.Router();

// Protected routes
router.post('/', checkAuth, bookExperience);
router.get('/my-bookings', checkAuth, getMyBookings);
router.get('/guide-bookings', checkAuth, getGuideBookings);
router.put('/:bookingId/status', checkAuth, updateBookingStatus);
router.put('/:bookingId/cancel', checkAuth, cancelBooking);
router.post('/:bookingId/review', checkAuth, addReview);

export default router;