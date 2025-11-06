import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  experienceId: mongoose.Types.ObjectId;
  guideId: mongoose.Types.ObjectId;
  bookingDate: Date;
  experienceDate: Date;
  numberOfParticipants: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  review?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
}

const bookingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  experienceId: {
    type: Schema.Types.ObjectId,
    ref: 'Experience',
    required: true
  },
  guideId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  experienceDate: {
    type: Date,
    required: true
  },
  numberOfParticipants: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ guideId: 1, status: 1 });
bookingSchema.index({ experienceId: 1, status: 1 });

export default mongoose.model<IBooking>('Booking', bookingSchema);