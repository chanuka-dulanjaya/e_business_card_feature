import express from 'express';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all employees (requires authentication)
router.get('/', authenticate, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });

    const employeesData = employees.map(emp => ({
      id: emp._id.toString(),
      userId: emp.userId.toString(),
      email: emp.email,
      fullName: emp.fullName,
      role: emp.role,
      mobileNumber: emp.mobileNumber,
      profilePicture: emp.profilePicture,
      position: emp.position,
      address: emp.address,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt
    }));

    res.json(employeesData);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get single employee (public - no auth required)
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({
      id: employee._id.toString(),
      email: employee.email,
      fullName: employee.fullName,
      mobileNumber: employee.mobileNumber,
      profilePicture: employee.profilePicture,
      position: employee.position,
      address: employee.address
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create employee (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { email, password, fullName, role, mobileNumber, profilePicture, position, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user account
    const user = new User({ email, password });
    await user.save();

    // Create employee record
    const employee = new Employee({
      userId: user._id,
      email,
      fullName,
      role: role || 'user',
      mobileNumber,
      profilePicture,
      position,
      address
    });
    await employee.save();

    res.status(201).json({
      id: employee._id.toString(),
      userId: employee.userId.toString(),
      email: employee.email,
      fullName: employee.fullName,
      role: employee.role,
      mobileNumber: employee.mobileNumber,
      profilePicture: employee.profilePicture,
      position: employee.position,
      address: employee.address,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee (admin can update any, user can update own profile)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check permissions
    const isAdmin = req.userRole === 'admin';
    const isOwnProfile = req.employeeId === employeeId;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Users can update their own profile fields (except role)
    // Admins can update everything including role
    const { fullName, role, mobileNumber, profilePicture, position, address } = req.body;

    employee.fullName = fullName !== undefined ? fullName : employee.fullName;
    employee.mobileNumber = mobileNumber !== undefined ? mobileNumber : employee.mobileNumber;
    employee.profilePicture = profilePicture !== undefined ? profilePicture : employee.profilePicture;
    employee.position = position !== undefined ? position : employee.position;
    employee.address = address !== undefined ? address : employee.address;

    // Only admin can change role
    if (isAdmin && role !== undefined) {
      employee.role = role;
    }

    await employee.save();

    res.json({
      id: employee._id.toString(),
      userId: employee.userId.toString(),
      email: employee.email,
      fullName: employee.fullName,
      role: employee.role,
      mobileNumber: employee.mobileNumber,
      profilePicture: employee.profilePicture,
      position: employee.position,
      address: employee.address,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete user account
    await User.findByIdAndDelete(employee.userId);

    // Delete employee record
    await Employee.findByIdAndDelete(req.params.id);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

export default router;
