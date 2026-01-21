import mongoose from 'mongoose';

const businessCardSchema = new mongoose.Schema({
  // Owner of the business card
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Optional: Team association
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  // Optional: Organization association
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  // Card details
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },
  mobileNumber: {
    type: String,
    trim: true,
    default: null
  },
  position: {
    type: String,
    trim: true,
    default: null
  },
  company: {
    type: String,
    trim: true,
    default: null
  },
  department: {
    type: String,
    trim: true,
    default: null
  },
  address: {
    type: String,
    trim: true,
    default: null
  },
  website: {
    type: String,
    trim: true,
    default: null
  },
  profilePicture: {
    type: String,
    default: null
  },
  // Social links
  socialLinks: {
    linkedin: { type: String, default: null },
    twitter: { type: String, default: null },
    facebook: { type: String, default: null },
    instagram: { type: String, default: null },
    github: { type: String, default: null }
  },
  // Card customization
  cardTheme: {
    type: String,
    enum: ['default', 'modern', 'classic', 'minimal', 'bold'],
    default: 'default'
  },
  primaryColor: {
    type: String,
    default: '#1e293b'
  },
  // QR code data (stored for quick access)
  qrCodeData: {
    type: String,
    default: null
  },
  // Visibility
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewed: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
businessCardSchema.index({ userId: 1 });
businessCardSchema.index({ teamId: 1 });
businessCardSchema.index({ organizationId: 1 });
businessCardSchema.index({ email: 1 });
businessCardSchema.index({ isPublic: 1, isActive: 1 });

// Compound index for checking individual user card limit
businessCardSchema.index({ userId: 1, isActive: 1 });

const BusinessCard = mongoose.model('BusinessCard', businessCardSchema);

export default BusinessCard;
