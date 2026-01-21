import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readline from 'readline';
import User from './models/User.js';
import Employee from './models/Employee.js';

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const clearDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('ERROR: MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB\n');

    // Show current database stats
    const userCount = await User.countDocuments();
    const employeeCount = await Employee.countDocuments();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Current Database Status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  📊 Users: ${userCount}`);
    console.log(`  👥 Employees: ${employeeCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (userCount === 0 && employeeCount === 0) {
      console.log('Database is already empty. Nothing to clear.\n');
      await mongoose.connection.close();
      rl.close();
      process.exit(0);
    }

    // List all users
    if (userCount > 0) {
      console.log('Existing users:');
      const users = await User.find().select('email');
      const employees = await Employee.find();

      for (const user of users) {
        const emp = employees.find(e => e.userId.toString() === user._id.toString());
        if (emp) {
          console.log(`  - ${user.email} (${emp.fullName}, ${emp.role})`);
        } else {
          console.log(`  - ${user.email}`);
        }
      }
      console.log('');
    }

    // Confirm deletion
    const answer = await question('⚠️  Are you sure you want to DELETE ALL data? (yes/no): ');

    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Operation cancelled. No data was deleted.');
      await mongoose.connection.close();
      rl.close();
      process.exit(0);
    }

    // Delete all documents
    console.log('\nDeleting all data...');
    await User.deleteMany({});
    console.log('✓ Deleted all users');
    await Employee.deleteMany({});
    console.log('✓ Deleted all employees');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✓ Database Cleared Successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nYou can now:');
    console.log('  1. Create a new admin: node server/createAdmin.js');
    console.log('  2. Change database: Update MONGODB_URI in .env file\n');

    await mongoose.connection.close();
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
  }
};

const showInfo = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('ERROR: MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);

    const userCount = await User.countDocuments();
    const employeeCount = await Employee.countDocuments();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Database Information');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  📊 Total Users: ${userCount}`);
    console.log(`  👥 Total Employees: ${employeeCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (userCount > 0) {
      console.log('Users in database:');
      const users = await User.find().select('email createdAt');
      const employees = await Employee.find();

      for (const user of users) {
        const emp = employees.find(e => e.userId.toString() === user._id.toString());
        if (emp) {
          console.log(`  📧 ${user.email}`);
          console.log(`     Name: ${emp.fullName}`);
          console.log(`     Role: ${emp.role}`);
          console.log(`     Created: ${user.createdAt.toISOString()}`);
          console.log('');
        }
      }
    } else {
      console.log('No users found in database.\n');
    }

    await mongoose.connection.close();
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
  }
};

// Main menu
const command = process.argv[2];

if (command === 'clear' || command === 'reset') {
  clearDatabase();
} else if (command === 'info' || command === 'list') {
  showInfo();
} else {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Database Management Utility');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nCommands:');
  console.log('  node server/dbManagement.js info   - Show database information');
  console.log('  node server/dbManagement.js clear  - Clear all data from database');
  console.log('\nTo change database:');
  console.log('  Edit MONGODB_URI in your .env file');
  rl.close();
  process.exit(0);
}
