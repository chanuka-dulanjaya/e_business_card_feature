import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const SUPER_ADMIN_EMAIL = 'chanudulanjaya998@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Chanuka@123';
const SUPER_ADMIN_NAME = 'Super Admin';

const seedSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('ERROR: MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ email: SUPER_ADMIN_EMAIL });

    if (existingAdmin) {
      // Update existing user to super_admin if not already
      if (existingAdmin.role !== 'super_admin') {
        existingAdmin.role = 'super_admin';
        existingAdmin.isEmailVerified = true;
        existingAdmin.isActive = true;
        await existingAdmin.save();
        console.log('Existing user upgraded to Super Admin');
      } else {
        console.log('Super Admin already exists');
      }
    } else {
      // Create new super admin
      const superAdmin = new User({
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
        fullName: SUPER_ADMIN_NAME,
        userType: 'organization', // Super admin has full organization capabilities
        role: 'super_admin',
        isEmailVerified: true,
        isActive: true
      });

      await superAdmin.save();
      console.log('Super Admin created successfully!');
    }

    console.log('\nSuper Admin Credentials:');
    console.log('========================');
    console.log(`Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log('\nIMPORTANT: Change the password after first login!');

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding super admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
