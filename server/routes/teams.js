import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { authenticate, canManageTeam } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all teams for current user
router.get('/', async (req, res) => {
  try {
    let teams;

    if (req.userRole === 'super_admin') {
      // Super admin can see all teams
      teams = await Team.find()
        .populate('ownerId', 'fullName email')
        .populate('organizationId', 'name')
        .populate('members.userId', 'fullName email profilePicture')
        .sort({ createdAt: -1 });
    } else {
      // Regular users see their own teams or teams they're members of
      teams = await Team.find({
        $or: [
          { ownerId: req.userId },
          { 'members.userId': req.userId }
        ]
      })
        .populate('ownerId', 'fullName email')
        .populate('organizationId', 'name')
        .populate('members.userId', 'fullName email profilePicture')
        .sort({ createdAt: -1 });
    }

    res.json({ teams });
  } catch (error) {
    logger.error('Get teams error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Create team
router.post('/', canManageTeam, async (req, res) => {
  try {
    const { name, description, organizationId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    // If organizationId provided, verify ownership
    if (organizationId) {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      if (req.userRole !== 'super_admin' && organization.ownerId.toString() !== req.userId) {
        return res.status(403).json({ error: 'You do not own this organization' });
      }
    }

    const team = new Team({
      name,
      description,
      ownerId: req.userId,
      organizationId: organizationId || null,
      members: [] // Owner is not automatically a member
    });

    await team.save();

    logger.info('Team created', {
      teamId: team._id.toString(),
      ownerId: req.userId,
      organizationId
    });

    res.status(201).json({
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    logger.error('Create team error:', { error: error.message });
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Get single team
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('ownerId', 'fullName email')
      .populate('organizationId', 'name logo')
      .populate('members.userId', 'fullName email profilePicture userType');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check access
    const isOwner = team.ownerId._id.toString() === req.userId;
    const isMember = team.members.some(m => m.userId._id.toString() === req.userId);

    if (req.userRole !== 'super_admin' && !isOwner && !isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ team });
  } catch (error) {
    logger.error('Get team error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Update team
router.put('/:id', canManageTeam, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check ownership
    if (req.userRole !== 'super_admin' && team.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, description, isActive } = req.body;

    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (isActive !== undefined) team.isActive = isActive;

    await team.save();

    logger.info('Team updated', {
      teamId: team._id.toString(),
      updatedBy: req.userId
    });

    res.json({
      message: 'Team updated successfully',
      team
    });
  } catch (error) {
    logger.error('Update team error:', { error: error.message });
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete team
router.delete('/:id', canManageTeam, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check ownership
    if (req.userRole !== 'super_admin' && team.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Remove team reference from users
    await User.updateMany(
      { teamId: team._id },
      { $set: { teamId: null } }
    );

    await Team.findByIdAndDelete(team._id);

    logger.info('Team deleted', {
      teamId: team._id.toString(),
      deletedBy: req.userId
    });

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    logger.error('Delete team error:', { error: error.message });
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Add member to team
router.post('/:id/members', canManageTeam, async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check ownership
    if (req.userRole !== 'super_admin' && team.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const existingMember = team.members.find(m => m.userId.toString() === userId);
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a team member' });
    }

    // Add member
    team.members.push({
      userId,
      role,
      joinedAt: new Date()
    });

    await team.save();

    // Update user's team reference
    user.teamId = team._id;
    if (team.organizationId) {
      user.organizationId = team.organizationId;
    }
    await user.save();

    logger.info('Team member added', {
      teamId: team._id.toString(),
      memberId: userId,
      addedBy: req.userId
    });

    // Return updated team with populated members
    const updatedTeam = await Team.findById(team._id)
      .populate('members.userId', 'fullName email profilePicture');

    res.json({
      message: 'Member added successfully',
      team: updatedTeam
    });
  } catch (error) {
    logger.error('Add team member error:', { error: error.message });
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

// Remove member from team
router.delete('/:id/members/:memberId', canManageTeam, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check ownership
    if (req.userRole !== 'super_admin' && team.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const memberIndex = team.members.findIndex(
      m => m.userId.toString() === req.params.memberId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Member not found in team' });
    }

    team.members.splice(memberIndex, 1);
    await team.save();

    // Remove team reference from user
    await User.findByIdAndUpdate(req.params.memberId, {
      $set: { teamId: null }
    });

    logger.info('Team member removed', {
      teamId: team._id.toString(),
      memberId: req.params.memberId,
      removedBy: req.userId
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    logger.error('Remove team member error:', { error: error.message });
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

// Update member role
router.put('/:id/members/:memberId', canManageTeam, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['member', 'team_admin'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required (member or team_admin)' });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check ownership
    if (req.userRole !== 'super_admin' && team.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const member = team.members.find(
      m => m.userId.toString() === req.params.memberId
    );

    if (!member) {
      return res.status(404).json({ error: 'Member not found in team' });
    }

    member.role = role;
    await team.save();

    logger.info('Team member role updated', {
      teamId: team._id.toString(),
      memberId: req.params.memberId,
      newRole: role,
      updatedBy: req.userId
    });

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    logger.error('Update team member role error:', { error: error.message });
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

export default router;
