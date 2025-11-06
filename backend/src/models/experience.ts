import mongoose, { Document, Schema } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  category: string;
  description: string;
  steps: string[];
  dateTime: Date;
  duration: number;
  capacity: number;
  price: number;
  address: string;
  guideId: mongoose.Types.ObjectId;
  images?: string[];
  isActive: boolean;
  bookings?: mongoose.Types.ObjectId[];
  rating?: number;
  reviewsCount?: number;
}

const experienceSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'فرهنگی',
      'هنری',
      'ورزشی',
      'طبیعتگردی',
      'غذایی',
      'تکنولوژی',
      'کسبوکار',
      'آموزشی',
      'مذهبی',
      'تفریحی'
    ]
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  steps: [{
    type: String,
    required: true
  }],
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  address: {
    type: String,
    required: true
  },
  guideId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  bookings: [{
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
experienceSchema.index({ guideId: 1, dateTime: 1 });
experienceSchema.index({ category: 1, isActive: 1 });
experienceSchema.index({ dateTime: 1, isActive: 1 });

export default mongoose.model<IExperience>('Experience', experienceSchema);