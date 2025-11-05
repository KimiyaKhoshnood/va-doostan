import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import HttpError from '../models/http.error.js';
import { isEmpty } from '../utils/utils.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {

  const { name, email, password } = req.body;

  try {
    if (isEmpty(name) || isEmpty(email) || isEmpty(password)) {
      return next(new HttpError('Please provide name, email and password', 422));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new HttpError('User already exists, please login instead', 422));
    }

    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      userId: user.id,
      email: user.email,
      name: user.name,
      accessToken,
    });

  } catch (err) {
    console.log(err);
    return next(new HttpError('Registration failed, please try again', 500));
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    if (isEmpty(email) || isEmpty(password)) {
      return next(new HttpError('Please provide email and password', 422));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new HttpError('Invalid credentials, could not log you in', 401));
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return next(new HttpError('Invalid credentials, could not log you in', 401));
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      userId: user.id,
      email: user.email,
      name: user.name,
      accessToken,
    });
  } catch (err) {
    return next(new HttpError('Login failed, please try again', 500));
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'No token' });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err: unknown, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    const newAccessToken = jwt.sign(
      { userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  });
}

// Get user profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // The user ID should be attached to the request by the auth middleware
    const userId = (req as any).userData.userId;

    const user = await User.findById(userId, '-password');
    if (!user) {
      return next(new HttpError('User not found', 404));
    }

    res.json({
      userId: user.id,
      email: user.email,
      name: user.name
    });
  } catch (err) {
    return next(new HttpError('Getting profile failed, please try again', 500));
  }
};

// logout
// res.clearCookie('refreshToken', { path: '/auth/refresh' });