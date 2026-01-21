import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Employee from './models/Employee.js';

// Load environment variables
dotenv.config();

const createAdmin = async (email, password, fullName) => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('ERROR: MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error(`✗ User with email "${email}" already exists`);
      console.log('\nUse resetPassword.js to reset the password instead.');
      process.exit(1);
    }

    // Create user
    const user = new User({ email, password });
    await user.save();
    console.log('✓ User account created');

    // Create employee record with admin role
    const employee = new Employee({
      userId: user._id,
      email,
      fullName,
      role: 'admin'
    });
    await employee.save();
    console.log('✓ Employee record created with admin role');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✓ Admin Account Created Successfully!');
    console.log(`  📧 Email: ${email}`);
    console.log(`  👤 Name: ${fullName}`);
    console.log(`  🔐 Role: admin`);
    console.log(`  🔑 Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nYou can now login with these credentials!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

// Get arguments from command line
const email = process.argv[2];
const password = process.argv[3];
const fullName = process.argv[4] || 'Admin User';

if (!email || !password) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Create Admin Account');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nUsage: node server/createAdmin.js <email> <password> [fullName]');
  console.log('\nExamples:');
  console.log('  node server/createAdmin.js admin@company.com SecurePass123');
  console.log('  node server/createAdmin.js admin@company.com SecurePass123 "John Doe"');
  process.exit(1);
}

createAdmin(email, password, fullName);
