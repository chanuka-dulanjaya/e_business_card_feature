import express from 'express';
import BusinessCard from '../models/BusinessCard.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get public business card (no auth required)
router.get('/public/:id', async (req, res) => {
  try {
    const card = await BusinessCard.findById(req.params.id)
      .populate('organizationId', 'name logo')
      .populate('teamId', 'name');

    if (!card) {
      return res.status(404).json({ error: 'Business card not found' });
    }

    if (!card.isPublic || !card.isActive) {
      return res.status(404).json({ error: 'Business card not found' });
    }

    // Increment view count
    card.viewCount += 1;
    card.lastViewed = new Date();
    await card.save();

    res.json({ card });
  } catch (error) {
    logger.error('Get public business card error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch business card' });
  }
});

// All routes below require authentication
router.use(authenticate);

// Get all business cards for current user
router.get('/', async (req, res) => {
  try {
    let cards;

    if (req.userRole === 'super_admin') {
      // Super admin can see all cards
      cards = await BusinessCard.find()
        .populate('userId', 'fullName email userType')
        .populate('organizationId', 'name')
        .populate('teamId', 'name')
        .sort({ createdAt: -1 });
    } else {
      // Regular users see only their cards
      cards = await BusinessCard.find({ userId: req.userId })
        .populate('organizationId', 'name')
        .populate('teamId', 'name')
        .sort({ createdAt: -1 });
    }

    res.json({ cards });
  } catch (error) {
    logger.error('Get business cards error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch business cards' });
  }
});

// Create business card
router.post('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    // Check user type limits
    if (user.userType === 'individual') {
      // Individual users can only have 1 active card
      const existingCardCount = await BusinessCard.countDocuments({
        userId: req.userId,
        isActive: true
      });

      if (existingCardCount >= 1) {
        return res.status(400).json({
          error: 'Individual users can only have one business card. Please upgrade to team or organization account for more cards.'
        });
      }
    }

    const {
      fullName,
      email,
      phone,
      mobileNumber,
      position,
      company,
      department,
      address,
      website,
      profilePicture,
      socialLinks,
      cardTheme,
      primaryColor,
      isPublic,
      teamId,
      organizationId
    } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    const card = new BusinessCard({
      userId: req.userId,
      fullName,
      email,
      phone,
      mobileNumber,
      position,
      company,
      department,
      address,
      website,
      profilePicture,
      socialLinks,
      cardTheme,
      primaryColor,
      isPublic: isPublic !== false,
      teamId: teamId || user.teamId,
      organizationId: organizationId || user.organizationId
    });

    await card.save();

    logger.info('Business card created', {
      cardId: card._id.toString(),
      userId: req.userId
    });

    res.status(201).json({
      message: 'Business card created successfully',
      card
    });
  } catch (error) {
    logger.error('Create business card error:', { error: error.message });
    res.status(500).json({ error: 'Failed to create business card' });
  }
});

// Get single business card
router.get('/:id', async (req, res) => {
  try {
    const card = await BusinessCard.findById(req.params.id)
      .populate('userId', 'fullName email userType')
      .populate('organizationId', 'name logo')
      .populate('teamId', 'name');

    if (!card) {
      return res.status(404).json({ error: 'Business card not found' });
    }

    // Check access
    if (req.userRole !== 'super_admin' && card.userId._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ card });
  } catch (error) {
    logger.error('Get business card error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch business card' });
  }
});

// Update business card
router.put('/:id', async (req, res) => {
  try {
    const card = await BusinessCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ error: 'Business card not found' });
    }

    // Check ownership
    if (req.userRole !== 'super_admin' && card.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      fullName,
      email,
      phone,
      mobileNumber,
      position,
      company,
      department,
      address,
      website,
      profilePicture,
      socialLinks,
      cardTheme,
      primaryColor,
      isPublic,
      isActive
    } = req.body;

    if (fullName) card.fullName = fullName;
    if (email) card.email = email;
    if (phone !== undefined) card.phone = phone;
    if (mobileNumber !== undefined) card.mobileNumber = mobileNumber;
    if (position !== undefined) card.position = position;
    if (company !== undefined) card.company = company;
    if (department !== undefined) card.department = department;
    if (address !== undefined) card.address = address;
    if (website !== undefined) card.website = website;
    if (profilePicture !== undefined) card.profilePicture = profilePicture;
    if (socialLinks) card.socialLinks = { ...card.socialLinks, ...socialLinks };
    if (cardTheme) card.cardTheme = cardTheme;
    if (primaryColor) card.primaryColor = primaryColor;
    if (isPublic !== undefined) card.isPublic = isPublic;
    if (isActive !== undefined) card.isActive = isActive;

    await card.save();

    logger.info('Business card updated', {
      cardId: card._id.toString(),
      updatedBy: req.userId
    });

    res.json({
      message: 'Business card updated successfully',
      card
    });
  } catch (error) {
    logger.error('Update business card error:', { error: error.message });
    res.status(500).json({ error: 'Failed to update business card' });
  }
});

// Delete business card
router.delete('/:id', async (req, res) => {
  try {
    const card = await BusinessCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ error: 'Business card not found' });
    }

    // Check ownership
    if (req.userRole !== 'super_admin' && card.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await BusinessCard.findByIdAndDelete(card._id);

    logger.info('Business card deleted', {
      cardId: card._id.toString(),
      deletedBy: req.userId
    });

    res.json({ message: 'Business card deleted successfully' });
  } catch (error) {
    logger.error('Delete business card error:', { error: error.message });
    res.status(500).json({ error: 'Failed to delete business card' });
  }
});

// Get card analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const card = await BusinessCard.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ error: 'Business card not found' });
    }

    // Check ownership
    if (req.userRole !== 'super_admin' && card.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      analytics: {
        viewCount: card.viewCount,
        lastViewed: card.lastViewed,
        createdAt: card.createdAt,
        isPublic: card.isPublic,
        isActive: card.isActive
      }
    });
  } catch (error) {
    logger.error('Get card analytics error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
