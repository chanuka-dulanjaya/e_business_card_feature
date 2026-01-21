import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

// Import routes
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('ERROR: MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log('✓ API available at http://localhost:' + PORT + '/api');

    // Start Vite dev server
    console.log('\n✓ Starting Vite dev server...');
    const vite = spawn('npx', ['vite', '--port', '5173'], {
      stdio: 'inherit',
      shell: true,
      cwd: join(__dirname, '..')
    });

    vite.on('error', (error) => {
      console.error('Failed to start Vite:', error);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🚀 Application is ready!');
    console.log('  📱 Frontend: http://localhost:5173');
    console.log('  🔌 Backend API: http://localhost:' + PORT + '/api');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await mongoose.connection.close();
    process.exit(0);
  });
};

startServer();
