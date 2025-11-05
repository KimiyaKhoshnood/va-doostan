import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import HttpError from '../models/http.error.js';

// JWT Secret - in production, use environment variables
const JWT_SECRET = 'your_jwt_secret_key';

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new HttpError('Authentication failed! No token provided.', 401));
    }

    const token = authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    if (!token) {
      return next(new HttpError('Authentication failed! Invalid token format.', 401));
    }

    // Verify token
    const decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    // Add user data to request
    (req as any).userData = { userId: decodedToken.userId, email: decodedToken.email };
    
    next();
  } catch (err) {
    return next(new HttpError('Authentication failed! Invalid token.', 401));
  }
};