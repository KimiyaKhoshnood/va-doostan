import { Request, Response, NextFunction } from 'express';
import Booking from '../models/booking.js';
import Experience from '../models/experience.js';
import User from '../models/user.js';
import HttpError from '../models/http.error.js';
import { isEmpty } from '../utils/utils.js';

// Book an experience
export const bookExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userData.userId;
    const { experienceId, numberOfParticipants, notes } = req.body;

    // Validate input
    if (!experienceId || !numberOfParticipants || numberOfParticipants < 1) {
      return next(new HttpError('Please provide experience ID and number of participants', 422));
    }

    // Get experience details
    const experience = await Experience.findById(experienceId);
    if (!experience) {
      return next(new HttpError('Experience not found', 404));
    }

    if (!experience.isActive) {
      return next(new HttpError('This experience is no longer available', 400));
    }

    // Check if experience date is in the future
    if (experience.dateTime <= new Date()) {
      return next(new HttpError('Cannot book past experiences', 400));
    }

    // Check capacity
    const existingBookings = await Booking.find({
      experienceId,
      status: { $in: ['pending', 'confirmed'] }
    });

    const totalBookedParticipants = existingBookings.reduce((sum, booking) => 
      sum + booking.numberOfParticipants, 0
    );

    if (totalBookedParticipants + numberOfParticipants > experience.capacity) {
      return next(new HttpError('Not enough capacity for this booking', 400));
    }

    // Calculate total price
    const totalPrice = experience.price * numberOfParticipants;

    // Create booking
    const booking = new Booking({
      userId,
      experienceId,
      guideId: experience.guideId,
      experienceDate: experience.dateTime,
      numberOfParticipants,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending',
      notes: notes || ''
    });

    await booking.save();

    // Add booking to experience
    experience.bookings?.push(booking._id);
    await experience.save();

    res.status(201).json({
      message: 'Experience booked successfully',
      booking: {
        id: booking._id,
        experienceId: booking.experienceId,
        experienceDate: booking.experienceDate,
        numberOfParticipants: booking.numberOfParticipants,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    });

  } catch (error) {
    console.error('Book experience error:', error);
    return next(new HttpError('Failed to book experience', 500));
  }
};

// Get user's bookings
export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userData.userId;
    const { page = 1, limit = 10, status = 'all' } = req.query;

    const filter: any = { userId };
    if (status !== 'all') {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filter)
      .populate('experienceId', 'title category dateTime duration address price images')
      .populate('guideId', 'guideProfile.firstName guideProfile.lastName')
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalCount = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / Number(limit));

    res.status(200).json({
      bookings,
      totalPages,
      currentPage: Number(page),
      totalCount
    });

  } catch (error) {
    console.error('Get my bookings error:', error);
    return next(new HttpError('Failed to get bookings', 500));
  }
};

// Get guide's bookings
export const getGuideBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guideId = (req as any).userData.userId;
    const { page = 1, limit = 10, status = 'all' } = req.query;

    const filter: any = { guideId };
    if (status !== 'all') {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filter)
      .populate('experienceId', 'title category dateTime duration address price')
      .populate('userId', 'name email')
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalCount = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / Number(limit));

    res.status(200).json({
      bookings,
      totalPages,
      currentPage: Number(page),
      totalCount
    });

  } catch (error) {
    console.error('Get guide bookings error:', error);
    return next(new HttpError('Failed to get bookings', 500));
  }
};

// Update booking status (for guides)
export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guideId = (req as any).userData.userId;
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return next(new HttpError('Invalid status', 400));
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(new HttpError('Booking not found', 404));
    }

    // Check if the guide owns this booking
    if (booking.guideId.toString() !== guideId) {
      return next(new HttpError('You can only update your own bookings', 403));
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      message: 'Booking status updated successfully',
      booking: {
        id: booking._id,
        status: booking.status,
        updatedAt: booking.updatedAt
      }
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    return next(new HttpError('Failed to update booking status', 500));
  }
};

// Cancel booking (for users)
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userData.userId;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(new HttpError('Booking not found', 404));
    }

    // Check if the user owns this booking
    if (booking.userId.toString() !== userId) {
      return next(new HttpError('You can only cancel your own bookings', 403));
    }

    // Check if booking can be cancelled (not completed and not already cancelled)
    if (booking.status === 'completed') {
      return next(new HttpError('Cannot cancel completed bookings', 400));
    }

    if (booking.status === 'cancelled') {
      return next(new HttpError('Booking is already cancelled', 400));
    }

    // Check if experience date is in the future
    if (booking.experienceDate <= new Date()) {
      return next(new HttpError('Cannot cancel bookings for past experiences', 400));
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.status(200).json({
      message: 'Booking cancelled successfully',
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return next(new HttpError('Failed to cancel booking', 500));
  }
};

// Add review to booking
export const addReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userData.userId;
    const { bookingId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return next(new HttpError('Please provide a valid rating (1-5)', 400));
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(new HttpError('Booking not found', 404));
    }

    // Check if the user owns this booking
    if (booking.userId.toString() !== userId) {
      return next(new HttpError('You can only review your own bookings', 403));
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return next(new HttpError('You can only review completed experiences', 400));
    }

    // Check if review already exists
    if (booking.review) {
      return next(new HttpError('You have already reviewed this experience', 400));
    }

    booking.review = {
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date()
    };

    await booking.save();

    // Update experience rating
    const allBookings = await Booking.find({
      experienceId: booking.experienceId,
      status: 'completed',
      review: { $exists: true }
    });

    if (allBookings.length > 0) {
      const totalRating = allBookings.reduce((sum, b) => sum + (b.review?.rating || 0), 0);
      const averageRating = totalRating / allBookings.length;

      await Experience.findByIdAndUpdate(booking.experienceId, {
        rating: averageRating,
        reviewsCount: allBookings.length
      });
    }

    res.status(200).json({
      message: 'Review added successfully',
      review: booking.review
    });

  } catch (error) {
    console.error('Add review error:', error);
    return next(new HttpError('Failed to add review', 500));
  }
};