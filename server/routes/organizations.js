import express from 'express';
import Organization from '../models/Organization.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { authenticate, canManageOrganization } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all organizations for current user
router.get('/', async (req, res) => {
  try {
    let organizations;

    if (req.userRole === 'super_admin') {
      // Super admin can see all organizations
      organizations = await Organization.find()
        .populate('ownerId', 'fullName email')
        .sort({ createdAt: -1 });
    } else {
      // Regular users see only their organizations
      organizations = await Organization.find({ ownerId: req.userId })
        .populate('ownerId', 'fullName email')
        .sort({ createdAt: -1 });
    }

    res.json({ organizations });
  } catch (error) {
    logger.error('Get organizations error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Create organization (only organization type users)
router.post('/', canManageOrganization, async (req, res) => {
  try {
    const { name, description, logo, website, address, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    const organization = new Organization({
      name,
      description,
      ownerId: req.userId,
      logo,
      website,
      address,
      phone,
      email
    });

    await organization.save();

    logger.info('Organization created', {
      organizationId: organization._id.toString(),
      ownerId: req.userId
    });

    res.status(201).json({
      message: 'Organization created successfully',
      organization
    });
  } catch (error) {
    logger.error('Create organization error:', { error: error.message });
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// Get single organization
router.get('/:id', async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('ownerId', 'fullName email');

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check access
    if (req.userRole !== 'super_admin' && organization.ownerId._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get teams under this organization
    const teams = await Team.find({ organizationId: organization._id })
      .populate('ownerId', 'fullName email')
      .populate('members.userId', 'fullName email');

    // Get member count
    const memberCount = await User.countDocuments({ organizationId: organization._id });

    res.json({
      organization,
      teams,
      memberCount
    });
  } catch (error) {
    logger.error('Get organization error:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// Update organization
router.put('/:id', canManageOrganization, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check ownership
    if (req.userRole !== 'super_admin' && organization.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, description, logo, website, address, phone, email, isActive } = req.body;

    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (logo !== undefined) organization.logo = logo;
    if (website !== undefined) organization.website = website;
    if (address !== undefined) organization.address = address;
    if (phone !== undefined) organization.phone = phone;
    if (email !== undefined) organization.email = email;
    if (isActive !== undefined) organization.isActive = isActive;

    await organization.save();

    logger.info('Organization updated', {
      organizationId: organization._id.toString(),
      updatedBy: req.userId
    });

    res.json({
      message: 'Organization updated successfully',
      organization
    });
  } catch (error) {
    logger.error('Update organization error:', { error: error.message });
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

// Delete organization
router.delete('/:id', canManageOrganization, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check ownership
    if (req.userRole !== 'super_admin' && organization.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete all teams under this organization
    await Team.deleteMany({ organizationId: organization._id });

    // Remove organization reference from users
    await User.updateMany(
      { organizationId: organization._id },
      { $set: { organizationId: null } }
    );

    await Organization.findByIdAndDelete(organization._id);

    logger.info('Organization deleted', {
      organizationId: organization._id.toString(),
      deletedBy: req.userId
    });

    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    logger.error('Delete organization error:', { error: error.message });
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

export default router;
