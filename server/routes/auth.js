import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { authenticate } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Sign up (for creating first admin)
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = new User({ email, password });
    await user.save();

    // Create employee record
    const employee = new Employee({
      userId: user._id,
      email,
      fullName,
      role
    });
    await employee.save();

    // Generate token
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email
      },
      employee: {
        id: employee._id.toString(),
        email: employee.email,
        fullName: employee.fullName,
        role: employee.role,
        mobileNumber: employee.mobileNumber,
        profilePicture: employee.profilePicture,
        position: employee.position,
        address: employee.address
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info('Login attempt', {
      email,
      passwordLength: password?.length,
      passwordFirstChar: password?.[0],
      passwordLastChar: password?.[password.length - 1]
    });

    // Validate input
    if (!email || !password) {
      logger.warn('Login failed: Missing credentials', { email });
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      logger.warn('Login failed: User not found', { email });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    logger.debug('User found', { email, userId: user._id.toString() });

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn('Login failed: Invalid password', { email, userId: user._id.toString() });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    logger.debug('Password validated', { email, userId: user._id.toString() });

    // Find employee record
    const employee = await Employee.findOne({ userId: user._id });
    if (!employee) {
      logger.error('Login failed: Employee record not found', {
        email,
        userId: user._id.toString()
      });
      return res.status(404).json({ error: 'Employee record not found' });
    }

    logger.debug('Employee record found', {
      email,
      userId: user._id.toString(),
      employeeId: employee._id.toString(),
      role: employee.role
    });

    // Generate token
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    logger.info('Login successful', {
      email,
      userId: user._id.toString(),
      role: employee.role
    });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email
      },
      employee: {
        id: employee._id.toString(),
        email: employee.email,
        fullName: employee.fullName,
        role: employee.role,
        mobileNumber: employee.mobileNumber,
        profilePicture: employee.profilePicture,
        position: employee.position,
        address: employee.address
      }
    });
  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email
    });
    res.status(500).json({ error: 'Login failed' });
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    const employee = await Employee.findOne({ userId: req.userId });

    if (!user || !employee) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email
      },
      employee: {
        id: employee._id.toString(),
        email: employee.email,
        fullName: employee.fullName,
        role: employee.role,
        mobileNumber: employee.mobileNumber,
        profilePicture: employee.profilePicture,
        position: employee.position,
        address: employee.address
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
