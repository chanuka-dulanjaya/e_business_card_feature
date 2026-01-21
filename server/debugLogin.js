import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Employee from './models/Employee.js';

// Load environment variables
dotenv.config();

const debugLogin = async (email, password) => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('ERROR: MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Login Debug Tool');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 1: Check if user exists
    console.log(`Step 1: Looking for user with email: "${email}"`);
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.log('❌ User NOT found in database\n');

      // Show all users
      console.log('Available users in database:');
      const allUsers = await User.find().select('email');
      if (allUsers.length === 0) {
        console.log('  (No users found - database is empty)');
      } else {
        allUsers.forEach(u => console.log(`  - ${u.email}`));
      }

      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('✓ User found in database');
    console.log(`  User ID: ${user._id}`);
    console.log(`  Email in DB: "${user.email}"`);
    console.log('');

    // Test 2: Check employee record
    console.log('Step 2: Checking employee record...');
    const employee = await Employee.findOne({ userId: user._id });

    if (!employee) {
      console.log('❌ Employee record NOT found');
      console.log('  This user exists but has no employee record.');
      console.log('  This could happen if the signup process was incomplete.\n');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('✓ Employee record found');
    console.log(`  Employee ID: ${employee._id}`);
    console.log(`  Full Name: ${employee.fullName}`);
    console.log(`  Role: ${employee.role}`);
    console.log('');

    // Test 3: Verify password
    console.log('Step 3: Verifying password...');
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      console.log('❌ Password does NOT match');
      console.log('  The password you provided is incorrect.');
      console.log('  Use resetPassword.js to reset it.\n');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('✓ Password is correct\n');

    // Success
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅ ALL CHECKS PASSED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nLogin credentials are valid!');
    console.log('If you still cannot login, check:');
    console.log('  1. Frontend is sending correct email/password');
    console.log('  2. Network requests are reaching the server');
    console.log('  3. JWT_SECRET is set correctly in .env');
    console.log('  4. Check logs/application.log for detailed errors\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Get arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Login Debug Tool');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nUsage: node server/debugLogin.js <email> <password>');
  console.log('\nExample:');
  console.log('  node server/debugLogin.js admin@company.com MyPassword123');
  console.log('\nThis tool will:');
  console.log('  1. Check if the user exists in the database');
  console.log('  2. Verify the employee record exists');
  console.log('  3. Test if the password is correct\n');
  process.exit(1);
}

debugLogin(email, password);
