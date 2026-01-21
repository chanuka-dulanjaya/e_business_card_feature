import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  mobileNumber: {
    type: String,
    trim: true,
    default: null
  },
  profilePicture: {
    type: String,
    default: null
  },
  position: {
    type: String,
    trim: true,
    default: null
  },
  address: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
employeeSchema.index({ userId: 1 });
// Note: email index is automatically created by unique: true constraint

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
