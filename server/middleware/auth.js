import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account has been deactivated' });
    }

    req.userId = decoded.userId;
    req.userRole = user.role;
    req.userType = user.userType;
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Require admin or super_admin role
export const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'super_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Require super_admin role only
export const requireSuperAdmin = (req, res, next) => {
  if (req.userRole !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

// Check if user can manage organizations (organization type user or super admin)
export const canManageOrganization = (req, res, next) => {
  if (req.userRole === 'super_admin') {
    return next();
  }
  if (req.userType !== 'organization') {
    return res.status(403).json({ error: 'Organization management requires organization account type' });
  }
  next();
};

// Check if user can manage teams (team or organization type user or super admin)
export const canManageTeam = (req, res, next) => {
  if (req.userRole === 'super_admin') {
    return next();
  }
  if (req.userType !== 'team' && req.userType !== 'organization') {
    return res.status(403).json({ error: 'Team management requires team or organization account type' });
  }
  next();
};
