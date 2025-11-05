import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import HttpError from './models/http.error.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config()

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/auth', authRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
    throw new HttpError('Cant find route', 404);
});

app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'Unknown error occurred!' });
});

mongoose
    .connect('mongodb://127.0.0.1:27017/messanger')
    .then(() => {
        app.listen(5000)
    }).catch((err) => {
        console.log('connection failed', err);
    })
