import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Employee from './models/Employee.js';

// Load environment variables
dotenv.config();

const resetPassword = async (email, newPassword) => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('ERROR: MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB');

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`✗ User with email "${email}" not found`);
      console.log('\nAvailable users:');
      const allUsers = await User.find().select('email');
      allUsers.forEach(u => console.log(`  - ${u.email}`));
      process.exit(1);
    }

    // Get employee info for context
    const employee = await Employee.findOne({ userId: user._id });

    // Update password (will be automatically hashed by the pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✓ Password Reset Successful!');
    console.log(`  📧 Email: ${email}`);
    if (employee) {
      console.log(`  👤 Name: ${employee.fullName}`);
      console.log(`  🔐 Role: ${employee.role}`);
    }
    console.log(`  🔑 New Password: ${newPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nYou can now login with these credentials.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

// Get email and password from command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Password Reset Utility');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nUsage: node server/resetPassword.js <email> <new-password>');
  console.log('\nExample:');
  console.log('  node server/resetPassword.js admin@company.com NewPassword123');
  console.log('\nThis script works for any user (admin or employee).');
  process.exit(1);
}

resetPassword(email, newPassword);
