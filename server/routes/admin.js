import express from 'express';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Team from '../models/Team.js';
import BusinessCard from '../models/BusinessCard.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// All routes require authentication and super admin role
router.use(authenticate);
router.use(requireSuperAdmin);

// ============ DASHBOARD STATS ============

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      individualUsers,
      teamUsers,
      organizationUsers,
      totalOrganizations,
      totalTeams,
      totalBusinessCards,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ userType: 'individual' }),
      User.countDocuments({ userType: 'team' }),
      User.countDocuments({ userType: 'organization' }),
      Organization.countDocuments(),
      Team.countDocuments(),
      BusinessCard.countDocuments(),
      User.find()
        .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          byType: {
            individual: individualUsers,
            team: teamUsers,
            organization: organizationUsers
          }
        },
        organizations: totalOrganizations,
        teams: totalTeams,
        businessCards: totalBusinessCards
      },
      recentUsers
    });
  } catch (error) {
    logger.error('Get admin stats error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ============ USER MANAGEMENT ============

// Get all users (with pagination and filters)
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      userType,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    if (userType) query.userType = userType;
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
        .populate('organizationId', 'name')
        .populate('teamId', 'name')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get users error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
      .populate('organizationId')
      .populate('teamId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's business cards
    const businessCards = await BusinessCard.find({ userId: user._id });

    // If organization user, get their organizations
    let organizations = [];
    if (user.userType === 'organization') {
      organizations = await Organization.find({ ownerId: user._id });
    }

    // If team user, get their teams
    let teams = [];
    if (user.userType === 'team' || user.userType === 'organization') {
      teams = await Team.find({ ownerId: user._id });
    }

    res.json({
      user,
      businessCards,
      organizations,
      teams
    });
  } catch (error) {
    logger.error('Get user error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user (admin can update role, status, etc.)
router.put('/users/:id', async (req, res) => {
  try {
    const { fullName, role, userType, isActive, isEmailVerified } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent modifying own super_admin status
    if (user._id.toString() === req.userId && role !== 'super_admin') {
      return res.status(400).json({ error: 'Cannot remove your own super admin role' });
    }

    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (userType) user.userType = userType;
    if (isActive !== undefined) user.isActive = isActive;
    if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

    await user.save();

    logger.info('User updated by admin', {
      adminId: req.userId,
      targetUserId: user._id.toString(),
      changes: { fullName, role, userType, isActive, isEmailVerified }
    });

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    logger.error('Update user error:', { error: error.message });
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (soft delete - deactivate)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Prevent deleting other super admins
    if (user.role === 'super_admin') {
      return res.status(400).json({ error: 'Cannot delete super admin accounts' });
    }

    // Soft delete - deactivate
    user.isActive = false;
    await user.save();

    logger.info('User deactivated by admin', {
      adminId: req.userId,
      targetUserId: user._id.toString()
    });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    logger.error('Delete user error:', { error: error.message });
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Permanently delete user (hard delete)
router.delete('/users/:id/permanent', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Prevent deleting other super admins
    if (user.role === 'super_admin') {
      return res.status(400).json({ error: 'Cannot delete super admin accounts' });
    }

    // Delete related data
    await Promise.all([
      BusinessCard.deleteMany({ userId: user._id }),
      Organization.deleteMany({ ownerId: user._id }),
      Team.deleteMany({ ownerId: user._id }),
      // Remove user from team memberships
      Team.updateMany(
        { 'members.userId': user._id },
        { $pull: { members: { userId: user._id } } }
      )
    ]);

    // Delete user
    await User.findByIdAndDelete(user._id);

    logger.info('User permanently deleted by admin', {
      adminId: req.userId,
      targetUserId: user._id.toString(),
      userEmail: user.email
    });

    res.json({ message: 'User and all related data permanently deleted' });
  } catch (error) {
    logger.error('Permanent delete user error:', { error: error.message });
    res.status(500).json({ error: 'Failed to permanently delete user' });
  }
});

// ============ ORGANIZATION MANAGEMENT ============

// Get all organizations
router.get('/organizations', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [organizations, total] = await Promise.all([
      Organization.find(query)
        .populate('ownerId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Organization.countDocuments(query)
    ]);

    // Get team count for each organization
    const orgIds = organizations.map(o => o._id);
    const teamCounts = await Team.aggregate([
      { $match: { organizationId: { $in: orgIds } } },
      { $group: { _id: '$organizationId', count: { $sum: 1 } } }
    ]);

    const teamCountMap = {};
    teamCounts.forEach(tc => {
      teamCountMap[tc._id.toString()] = tc.count;
    });

    const orgsWithCounts = organizations.map(org => ({
      ...org.toObject(),
      teamCount: teamCountMap[org._id.toString()] || 0
    }));

    res.json({
      organizations: orgsWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get organizations error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// ============ TEAM MANAGEMENT ============

// Get all teams
router.get('/teams', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, organizationId } = req.query;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (organizationId) {
      query.organizationId = organizationId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [teams, total] = await Promise.all([
      Team.find(query)
        .populate('ownerId', 'fullName email')
        .populate('organizationId', 'name')
        .populate('members.userId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Team.countDocuments(query)
    ]);

    res.json({
      teams,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get teams error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// ============ BUSINESS CARD MANAGEMENT ============

// Get all business cards
router.get('/business-cards', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, userId } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    if (userId) {
      query.userId = userId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [businessCards, total] = await Promise.all([
      BusinessCard.find(query)
        .populate('userId', 'fullName email userType')
        .populate('teamId', 'name')
        .populate('organizationId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BusinessCard.countDocuments(query)
    ]);

    res.json({
      businessCards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get business cards error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch business cards' });
  }
});

// ============ ACTIVITY LOGS ============

// Get recent activity (based on user last login, createdAt, etc.)
router.get('/activity', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Get recent user activities
    const recentLogins = await User.find({ lastLogin: { $ne: null } })
      .select('email fullName lastLogin')
      .sort({ lastLogin: -1 })
      .limit(parseInt(limit));

    const recentRegistrations = await User.find()
      .select('email fullName createdAt userType')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const recentBusinessCards = await BusinessCard.find()
      .populate('userId', 'fullName email')
      .select('fullName email createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      recentLogins,
      recentRegistrations,
      recentBusinessCards
    });
  } catch (error) {
    logger.error('Get activity error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

export default router;
