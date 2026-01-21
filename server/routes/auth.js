import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import BusinessCard from '../models/BusinessCard.js';
import { authenticate } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Generate random token for email verification / password reset
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Sign up (public registration)
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, userType = 'individual' } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate user type
    if (!['individual', 'team', 'organization'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Generate email verification token
    const emailVerificationToken = generateRandomToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      fullName,
      userType,
      role: 'user',
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false // Set to true for now since we don't have email service configured
    });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info('User registered successfully', {
      email: user.email,
      userType: user.userType,
      userId: user._id.toString()
    });

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        role: user.role,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified
      },
      message: 'Registration successful. Please verify your email.'
    });
  } catch (error) {
    logger.error('Signup error:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info('Login attempt', { email });

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

    // Check if account is active
    if (!user.isActive) {
      logger.warn('Login failed: Account deactivated', { email });
      return res.status(401).json({ error: 'Account has been deactivated. Please contact support.' });
    }

    // Check if user has a password (not Google OAuth only)
    if (!user.password) {
      logger.warn('Login failed: User registered with Google', { email });
      return res.status(401).json({ error: 'Please login with Google' });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn('Login failed: Invalid password', { email, userId: user._id.toString() });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    logger.debug('Password validated', { email, userId: user._id.toString() });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info('Login successful', {
      email,
      userId: user._id.toString(),
      role: user.role,
      userType: user.userType
    });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        role: user.role,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        organizationId: user.organizationId,
        teamId: user.teamId
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

// Google OAuth - Exchange Google token for app token
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, fullName, profilePicture, userType = 'individual' } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ error: 'Google ID and email are required' });
    }

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with this email (might have registered with email/password)
      user = await User.findOne({ email: email.toLowerCase().trim() });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        if (profilePicture && !user.profilePicture) {
          user.profilePicture = profilePicture;
        }
        user.isEmailVerified = true; // Google emails are verified
        await user.save();
      } else {
        // Create new user
        user = new User({
          email: email.toLowerCase().trim(),
          fullName,
          googleId,
          profilePicture,
          userType,
          role: 'user',
          isEmailVerified: true // Google emails are verified
        });
        await user.save();

        logger.info('New Google user registered', {
          email: user.email,
          userType: user.userType,
          userId: user._id.toString()
        });
      }
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account has been deactivated. Please contact support.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info('Google login successful', {
      email: user.email,
      userId: user._id.toString()
    });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        role: user.role,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        organizationId: user.organizationId,
        teamId: user.teamId
      }
    });
  } catch (error) {
    logger.error('Google auth error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Don't reveal if user exists or not
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Check if user registered with Google only
    if (user.googleId && !user.password) {
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate password reset token
    const resetToken = generateRandomToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // TODO: Send email with reset link
    // For now, log the token (in production, send via email)
    logger.info('Password reset requested', {
      email: user.email,
      resetToken: resetToken // Remove this in production
    });

    // In development, return the token
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        message: 'Password reset token generated',
        resetToken // Only in development
      });
    }

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    logger.error('Forgot password error', { error: error.message });
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    logger.info('Password reset successful', { email: user.email });

    res.json({ message: 'Password has been reset successfully. You can now login with your new password.' });
  } catch (error) {
    logger.error('Reset password error', { error: error.message });
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Change password (authenticated)
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

    // Check if user has a password (not Google OAuth only)
    if (!user.password) {
      return res.status(400).json({ error: 'Cannot change password for Google-only accounts. Please set a password first.' });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info('Password changed successfully', { userId: user._id.toString() });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', { error: error.message });
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Set password (for Google OAuth users who want to add password login)
router.post('/set-password', authenticate, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.password) {
      return res.status(400).json({ error: 'Password already set. Use change password instead.' });
    }

    user.password = newPassword;
    await user.save();

    logger.info('Password set successfully', { userId: user._id.toString() });

    res.json({ message: 'Password set successfully. You can now login with email and password.' });
  } catch (error) {
    logger.error('Set password error:', { error: error.message });
    res.status(500).json({ error: 'Failed to set password' });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    logger.info('Email verified successfully', { email: user.email });

    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    logger.error('Email verification error:', { error: error.message });
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If an account with that email exists, a verification email has been sent.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    user.emailVerificationToken = generateRandomToken();
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // TODO: Send verification email
    logger.info('Verification email resent', { email: user.email });

    res.json({ message: 'If an account with that email exists, a verification email has been sent.' });
  } catch (error) {
    logger.error('Resend verification error:', { error: error.message });
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
      .populate('organizationId', 'name logo')
      .populate('teamId', 'name');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get business card count for user
    const businessCardCount = await BusinessCard.countDocuments({ userId: user._id, isActive: true });

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        role: user.role,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        organization: user.organizationId,
        team: user.teamId,
        businessCardCount,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Get current user error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { fullName, profilePicture } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    logger.info('Profile updated', { userId: user._id.toString() });

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    logger.error('Update profile error:', { error: error.message });
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
