import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');

    // List databases
    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();
    console.log('\nAvailable databases:');
    databases.forEach(db => console.log(`  - ${db.name}`));

    await mongoose.connection.close();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);

    if (error.message.includes('bad auth')) {
      console.log('\n💡 Suggestions:');
      console.log('1. Check your username and password in MongoDB Atlas');
      console.log('2. Make sure the database user has proper permissions');
      console.log('3. Verify your IP is whitelisted (or use 0.0.0.0/0 for testing)');
      console.log('4. Make sure you copied the connection string correctly');
    }

    process.exit(1);
  }
};

testConnection();
