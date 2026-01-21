import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not Google OAuth
    },
    minlength: 6
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  // User type: individual, team, organization
  userType: {
    type: String,
    enum: ['individual', 'team', 'organization'],
    required: true,
    default: 'individual'
  },
  // Role for access control
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  // Google OAuth
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values while maintaining uniqueness for non-null
  },
  profilePicture: {
    type: String,
    default: null
  },
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  // Password reset
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  // Reference to organization (for team members)
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  // Reference to team (for team members)
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for faster queries
userSchema.index({ googleId: 1 });
userSchema.index({ organizationId: 1 });
userSchema.index({ teamId: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

export default User;
