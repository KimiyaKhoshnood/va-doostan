import { Request, Response, NextFunction } from 'express';
import Experience from '../models/experience.js';
import User from '../models/user.js';
import HttpError from '../models/http.error.js';
import { isEmpty } from '../utils/utils.js';

// Create a new experience
export const createExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guideId = (req as any).userData.userId;
    const {
      title,
      category,
      description,
      steps,
      dateTime,
      duration,
      capacity,
      price,
      address,
      images
    } = req.body;

    // Validate required fields
    if (isEmpty(title) || isEmpty(category) || isEmpty(description) || 
        !steps || !Array.isArray(steps) || steps.length === 0 ||
        !dateTime || !duration || !capacity || !price || isEmpty(address)) {
      return next(new HttpError('Please provide all required fields', 422));
    }

    // Check if user is an approved experience guide
    const user = await User.findById(guideId);
    if (!user || !user.isExperienceGuide || !user.guideProfile?.isApproved) {
      return next(new HttpError('You must be an approved experience guide to create experiences', 403));
    }

    const experience = new Experience({
      title,
      category,
      description,
      steps,
      dateTime: new Date(dateTime),
      duration: Number(duration),
      capacity: Number(capacity),
      price: Number(price),
      address,
      guideId,
      images: images || [],
      isActive: true
    });

    await experience.save();

    res.status(201).json({
      message: 'Experience created successfully',
      experience
    });

  } catch (error) {
    console.error('Create experience error:', error);
    return next(new HttpError('Failed to create experience', 500));
  }
};

// Get all experiences with filters
export const getExperiences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      category, 
      city, 
      minPrice, 
      maxPrice, 
      dateFrom, 
      dateTo,
      page = 1, 
      limit = 10 
    } = req.query;

    const filter: any = { isActive: true };

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (dateFrom || dateTo) {
      filter.dateTime = {};
      if (dateFrom) filter.dateTime.$gte = new Date(dateFrom as string);
      if (dateTo) filter.dateTime.$lte = new Date(dateTo as string);
    }

    // If city is provided, we need to find guides in that city
    if (city) {
      const guidesInCity = await User.find({ 
        'guideProfile.city': city,
        'guideProfile.isApproved': true 
      }).select('_id');
      
      if (guidesInCity.length > 0) {
        filter.guideId = { $in: guidesInCity.map(g => g._id) };
      } else {
        // No guides in this city, return empty result
        return res.status(200).json({
          experiences: [],
          totalPages: 0,
          currentPage: page,
          totalCount: 0
        });
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const experiences = await Experience.find(filter)
      .populate('guideId', 'guideProfile.firstName guideProfile.lastName guideProfile.city')
      .sort({ dateTime: 1 })
      .skip(skip)
      .limit(Number(limit));

    const totalCount = await Experience.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / Number(limit));

    res.status(200).json({
      experiences,
      totalPages,
      currentPage: Number(page),
      totalCount
    });

  } catch (error) {
    console.error('Get experiences error:', error);
    return next(new HttpError('Failed to get experiences', 500));
  }
};

// Get single experience details
export const getExperienceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { experienceId } = req.params;

    const experience = await Experience.findById(experienceId)
      .populate('guideId', 'guideProfile.firstName guideProfile.lastName guideProfile.bio guideProfile.city guideProfile.expertise');

    if (!experience) {
      return next(new HttpError('Experience not found', 404));
    }

    if (!experience.isActive) {
      return next(new HttpError('This experience is no longer available', 404));
    }

    res.status(200).json(experience);

  } catch (error) {
    console.error('Get experience by id error:', error);
    return next(new HttpError('Failed to get experience', 500));
  }
};

// Update experience
export const updateExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guideId = (req as any).userData.userId;
    const { experienceId } = req.params;
    const updates = req.body;

    const experience = await Experience.findById(experienceId);
    if (!experience) {
      return next(new HttpError('Experience not found', 404));
    }

    // Check if the guide owns this experience
    if (experience.guideId.toString() !== guideId) {
      return next(new HttpError('You can only update your own experiences', 403));
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'guideId' && key !== 'createdAt' && key !== 'updatedAt') {
        (experience as any)[key] = updates[key];
      }
    });

    await experience.save();

    res.status(200).json({
      message: 'Experience updated successfully',
      experience
    });

  } catch (error) {
    console.error('Update experience error:', error);
    return next(new HttpError('Failed to update experience', 500));
  }
};

// Delete experience (soft delete)
export const deleteExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guideId = (req as any).userData.userId;
    const { experienceId } = req.params;

    const experience = await Experience.findById(experienceId);
    if (!experience) {
      return next(new HttpError('Experience not found', 404));
    }

    // Check if the guide owns this experience
    if (experience.guideId.toString() !== guideId) {
      return next(new HttpError('You can only delete your own experiences', 403));
    }

    // Soft delete by setting isActive to false
    experience.isActive = false;
    await experience.save();

    res.status(200).json({
      message: 'Experience deleted successfully'
    });

  } catch (error) {
    console.error('Delete experience error:', error);
    return next(new HttpError('Failed to delete experience', 500));
  }
};

// Get guide's own experiences
export const getMyExperiences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guideId = (req as any).userData.userId;
    const { page = 1, limit = 10, status = 'all' } = req.query;

    const filter: any = { guideId };
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const experiences = await Experience.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalCount = await Experience.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / Number(limit));

    res.status(200).json({
      experiences,
      totalPages,
      currentPage: Number(page),
      totalCount
    });

  } catch (error) {
    console.error('Get my experiences error:', error);
    return next(new HttpError('Failed to get your experiences', 500));
  }
};