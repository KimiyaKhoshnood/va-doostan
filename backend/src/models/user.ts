import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone?: string;
  isExperienceGuide: boolean;
  guideProfile?: {
    firstName: string;
    lastName: string;
    bio: string;
    expertise: string;
    activityField: string;
    city: string;
    activityArea: string;
    email: string;
    phone: string;
    socialMedia?: {
      instagram?: string;
      telegram?: string;
      linkedin?: string;
    };
    skillDocuments?: string[];
    profileImage?: string;
    isApproved: boolean;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  isExperienceGuide: {
    type: Boolean,
    default: false
  },
  guideProfile: {
    firstName: String,
    lastName: String,
    bio: String,
    expertise: String,
    activityField: String,
    city: String,
    activityArea: String,
    email: String,
    phone: String,
    socialMedia: {
      instagram: String,
      telegram: String,
      linkedin: String
    },
    skillDocuments: [String],
    profileImage: String,
    isApproved: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  const user = this as unknown as IUser;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the salt
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export default mongoose.model<IUser>('User', userSchema);