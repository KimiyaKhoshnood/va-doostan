import { Request, Response, NextFunction } from 'express';
import User from '../models/user.js';
import HttpError from '../models/http.error.js';
import { isEmpty } from '../utils/utils.js';

export const applyAsExperienceGuide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userData.userId;
    const {
      firstName,
      lastName,
      bio,
      expertise,
      activityField,
      city,
      activityArea,
      email,
      phone,
      socialMedia,
      skillDocuments,
      profileImage
    } = req.body;

    if (isEmpty(firstName) || isEmpty(lastName) || isEmpty(bio) || 
        isEmpty(expertise) || isEmpty(activityField) || isEmpty(city) || 
        isEmpty(activityArea) || isEmpty(email) || isEmpty(phone)) {
      return next(new HttpError('Please provide all required fields', 422));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError('User not found', 404));
    }

    if (user.isExperienceGuide && user.guideProfile?.isApproved) {
      return next(new HttpError('You are already an approved experience guide', 400));
    }

    user.isExperienceGuide = true;
    user.guideProfile = {
      firstName,
      lastName,
      bio,
      expertise,
      activityField,
      city,
      activityArea,
      email,
      phone,
      socialMedia: socialMedia || {},
      skillDocuments: skillDocuments || [],
      profileImage: profileImage || '',
      isApproved: false
    };

    await user.save();

    res.status(200).json({
      message: 'Your application has been submitted for review',
      guideProfile: user.guideProfile
    });

  } catch (error) {
    console.error('Apply as guide error:', error);
    return next(new HttpError('Failed to submit application', 500));
  }
};

export const getGuideProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userData.userId;

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError('User not found', 404));
    }

    if (!user.isExperienceGuide) {
      return next(new HttpError('You are not registered as an experience guide', 403));
    }

    res.status(200).json({
      guideProfile: user.guideProfile,
      isApproved: user.guideProfile?.isApproved
    });

  } catch (error) {
    console.error('Get guide profile error:', error);
    return next(new HttpError('Failed to get guide profile', 500));
  }
};

export const updateGuideProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userData.userId;
    const updates = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError('User not found', 404));
    }

    if (!user.isExperienceGuide) {
      return next(new HttpError('You are not registered as an experience guide', 403));
    }

    if (user.guideProfile) {
      Object.keys(updates).forEach(key => {
        if (user.guideProfile && key in user.guideProfile) {
          (user.guideProfile as any)[key] = updates[key];
        }
      });
    }

    await user.save();

    res.status(200).json({
      message: 'Guide profile updated successfully',
      guideProfile: user.guideProfile
    });

  } catch (error) {
    console.error('Update guide profile error:', error);
    return next(new HttpError('Failed to update guide profile', 500));
  }
};

export const getPublicGuideProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guideId } = req.params;

    const user = await User.findById(guideId);
    if (!user) {
      return next(new HttpError('Guide not found', 404));
    }

    if (!user.isExperienceGuide || !user.guideProfile?.isApproved) {
      return next(new HttpError('This user is not an approved experience guide', 404));
    }

    const publicProfile = {
      firstName: user.guideProfile.firstName,
      lastName: user.guideProfile.lastName,
      bio: user.guideProfile.bio,
      expertise: user.guideProfile.expertise,
      activityField: user.guideProfile.activityField,
      city: user.guideProfile.city,
      activityArea: user.guideProfile.activityArea,
      profileImage: user.guideProfile.profileImage,
      socialMedia: user.guideProfile.socialMedia
    };

    res.status(200).json(publicProfile);

  } catch (error) {
    console.error('Get public guide profile error:', error);
    return next(new HttpError('Failed to get guide profile', 500));
  }
};