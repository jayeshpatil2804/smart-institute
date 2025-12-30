const express = require('express');
const router = express.Router();
const { checkUserRightsAccess } = require('../../middleware/masterAuth');
const MasterUserRights = require('../../models/MasterUserRights');
const User = require('../../models/User');
const Branch = require('../../models/Branch');

// Apply admin-only middleware to all routes
router.use(checkUserRightsAccess);

// Get all user rights with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, userRole, branch, isActive } = req.query;
    
    // Build filter
    let filter = {};
    
    if (userRole) filter.userRole = userRole;
    if (branch) filter.branch = branch;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Search functionality
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { branchName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const userRights = await MasterUserRights.find(filter)
      .populate('user', 'email role')
      .populate('branch', 'name city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MasterUserRights.countDocuments(filter);
    
    res.json({
      userRights,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user rights error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single user rights
router.get('/:id', async (req, res) => {
  try {
    const userRights = await MasterUserRights.findById(req.params.id)
      .populate('user', 'email role firstName lastName')
      .populate('branch', 'name city state');
    
    if (!userRights) {
      return res.status(404).json({ message: 'User rights not found' });
    }
    
    res.json(userRights);
  } catch (error) {
    console.error('Get user rights error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create user rights
router.post('/', async (req, res) => {
  try {
    const {
      user,
      userName,
      userEmail,
      userRole,
      branch,
      branchName,
      permissions,
      specialPermissions,
      accessRestrictions,
      isActive,
      effectiveFrom,
      validUntil
    } = req.body;
    
    // Check if user rights already exist for this user-branch combination
    const existingRights = await MasterUserRights.findOne({ user, branch });
    
    if (existingRights) {
      return res.status(400).json({ 
        message: 'User rights already exist for this user and branch combination' 
      });
    }
    
    // Validate user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // Validate branch exists
    const branchExists = await Branch.findById(branch);
    if (!branchExists) {
      return res.status(400).json({ message: 'Branch not found' });
    }
    
    const userRights = new MasterUserRights({
      user,
      userName,
      userEmail,
      userRole,
      branch,
      branchName,
      permissions: permissions || {},
      specialPermissions: specialPermissions || [],
      accessRestrictions: accessRestrictions || {},
      isActive: isActive !== undefined ? isActive : true,
      effectiveFrom: effectiveFrom || new Date(),
      validUntil,
      createdBy: req.user._id,
      branchId: branch
    });
    
    await userRights.save();
    
    const populatedRights = await MasterUserRights.findById(userRights._id)
      .populate('user', 'email role firstName lastName')
      .populate('branch', 'name city');
    
    res.status(201).json(populatedRights);
  } catch (error) {
    console.error('Create user rights error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user rights
router.put('/:id', async (req, res) => {
  try {
    const userRights = await MasterUserRights.findById(req.params.id);
    
    if (!userRights) {
      return res.status(404).json({ message: 'User rights not found' });
    }
    
    const {
      userName,
      userEmail,
      userRole,
      permissions,
      specialPermissions,
      accessRestrictions,
      isActive,
      effectiveFrom,
      validUntil,
      modificationReason
    } = req.body;
    
    // Update user rights
    Object.assign(userRights, {
      userName,
      userEmail,
      userRole,
      permissions,
      specialPermissions,
      accessRestrictions,
      isActive,
      effectiveFrom,
      validUntil,
      lastModifiedBy: req.user._id,
      lastModifiedByName: `${req.user.firstName} ${req.user.lastName}`,
      modificationReason
    });
    
    await userRights.save();
    
    const populatedRights = await MasterUserRights.findById(userRights._id)
      .populate('user', 'email role firstName lastName')
      .populate('branch', 'name city');
    
    res.json(populatedRights);
  } catch (error) {
    console.error('Update user rights error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user rights
router.delete('/:id', async (req, res) => {
  try {
    const userRights = await MasterUserRights.findById(req.params.id);
    
    if (!userRights) {
      return res.status(404).json({ message: 'User rights not found' });
    }
    
    await MasterUserRights.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User rights deleted successfully' });
  } catch (error) {
    console.error('Delete user rights error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user rights by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userRights = await MasterUserRights.find({ user: userId })
      .populate('branch', 'name city')
      .sort({ createdAt: -1 });
    
    res.json(userRights);
  } catch (error) {
    console.error('Get user rights by user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user rights by branch
router.get('/branch/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    
    const userRights = await MasterUserRights.find({ branch: branchId })
      .populate('user', 'email role firstName lastName')
      .sort({ userName: 1 });
    
    res.json(userRights);
  } catch (error) {
    console.error('Get user rights by branch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get available users for rights assignment
router.get('/available-users/list', async (req, res) => {
  try {
    const { branchId } = req.query;
    
    // Get users who don't have rights for the specified branch
    let matchQuery = {};
    if (branchId) {
      matchQuery = { branch: branchId };
    }
    
    // Get users with existing rights
    const existingRights = await MasterUserRights.find(matchQuery).distinct('user');
    
    // Get available users (Admin and Branch Admin roles)
    const availableUsers = await User.find({
      _id: { $nin: existingRights },
      role: { $in: ['Admin', 'Branch Admin'] }
    })
    .select('firstName lastName email role')
    .sort({ firstName: 1, lastName: 1 });
    
    res.json(availableUsers);
  } catch (error) {
    console.error('Get available users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Clone user rights (for creating similar rights for another user)
router.post('/clone/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetUser, targetBranch } = req.body;
    
    const sourceRights = await MasterUserRights.findById(id);
    
    if (!sourceRights) {
      return res.status(404).json({ message: 'Source user rights not found' });
    }
    
    // Check if target user already has rights for the target branch
    const existingRights = await MasterUserRights.findOne({ 
      user: targetUser, 
      branch: targetBranch 
    });
    
    if (existingRights) {
      return res.status(400).json({ 
        message: 'Target user already has rights for this branch' 
      });
    }
    
    // Get target user details
    const targetUserDoc = await User.findById(targetUser);
    const targetBranchDoc = await Branch.findById(targetBranch);
    
    if (!targetUserDoc || !targetBranchDoc) {
      return res.status(400).json({ message: 'Target user or branch not found' });
    }
    
    // Clone the rights
    const clonedRights = new MasterUserRights({
      user: targetUser,
      userName: `${targetUserDoc.firstName} ${targetUserDoc.lastName}`,
      userEmail: targetUserDoc.email,
      userRole: targetUserDoc.role,
      branch: targetBranch,
      branchName: targetBranchDoc.name,
      permissions: sourceRights.permissions,
      specialPermissions: sourceRights.specialPermissions,
      accessRestrictions: sourceRights.accessRestrictions,
      isActive: true,
      effectiveFrom: new Date(),
      createdBy: req.user._id,
      branchId: targetBranch
    });
    
    await clonedRights.save();
    
    const populatedRights = await MasterUserRights.findById(clonedRights._id)
      .populate('user', 'email role firstName lastName')
      .populate('branch', 'name city');
    
    res.status(201).json(populatedRights);
  } catch (error) {
    console.error('Clone user rights error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Bulk update user permissions
router.put('/bulk-update', async (req, res) => {
  try {
    const { userRightsIds, permissions, modificationReason } = req.body;
    
    if (!userRightsIds || !Array.isArray(userRightsIds) || userRightsIds.length === 0) {
      return res.status(400).json({ message: 'User rights IDs are required' });
    }
    
    const updateResult = await MasterUserRights.updateMany(
      { _id: { $in: userRightsIds } },
      {
        $set: {
          permissions,
          lastModifiedBy: req.user._id,
          lastModifiedByName: `${req.user.firstName} ${req.user.lastName}`,
          modificationReason
        }
      }
    );
    
    res.json({
      message: 'User permissions updated successfully',
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update user permissions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
