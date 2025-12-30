const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MasterUserRights = require('../models/MasterUserRights');

// Check if user has Master access (Admin or Branch Admin)
const hasMasterAccess = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // Check if user has Master access role
    if (!['Admin', 'Branch Admin'].includes(user.role)) {
      return res.status(403).json({ 
        message: 'Forbidden: Only Admin and Branch Admin can access Master modules.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Check specific module permissions
const checkModulePermission = (module, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      // Get user rights for the specific branch
      const userRights = await MasterUserRights.findOne({ 
        user: user._id,
        branchId: user.branchId || req.body.branchId || req.query.branchId,
        isActive: true 
      });

      if (!userRights) {
        return res.status(403).json({ 
          message: 'Forbidden: No user rights configured for this branch.' 
        });
      }

      // Check if user has permission for the specific action on the module
      const modulePermissions = userRights.permissions[module];
      
      if (!modulePermissions || !modulePermissions[action]) {
        return res.status(403).json({ 
          message: `Forbidden: You do not have ${action} permission for ${module} module.` 
        });
      }

      // For Branch Admin, check if they can only access their own branch
      if (user.role === 'Branch Admin' && modulePermissions.ownBranchOnly) {
        const requestedBranchId = req.body.branchId || req.query.branchId || req.params.branchId;
        
        if (requestedBranchId && requestedBranchId !== user.branchId.toString()) {
          return res.status(403).json({ 
            message: 'Forbidden: Branch Admin can only manage their own branch.' 
          });
        }
      }

      req.userRights = userRights;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Internal server error during permission check.' });
    }
  };
};

// Check if user can access specific branch data
const checkBranchAccess = async (req, res, next) => {
  try {
    const user = req.user;
    const requestedBranchId = req.params.branchId || req.query.branchId || req.body.branchId;
    
    // Admin can access any branch
    if (user.role === 'Admin') {
      return next();
    }
    
    // Branch Admin can only access their own branch
    if (user.role === 'Branch Admin') {
      if (requestedBranchId && requestedBranchId !== user.branchId.toString()) {
        return res.status(403).json({ 
          message: 'Forbidden: Branch Admin can only access their own branch.' 
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Branch access check error:', error);
    res.status(500).json({ message: 'Internal server error during branch access check.' });
  }
};

// Check if user can create users for specific branch
const checkUserCreationAccess = async (req, res, next) => {
  try {
    const user = req.user;
    const targetBranchId = req.body.branchId;
    
    // Admin can create users for any branch
    if (user.role === 'Admin') {
      return next();
    }
    
    // Branch Admin can only create users for their own branch
    if (user.role === 'Branch Admin') {
      if (!targetBranchId || targetBranchId !== user.branchId.toString()) {
        return res.status(403).json({ 
          message: 'Forbidden: Branch Admin can only create users for their own branch.' 
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('User creation access check error:', error);
    res.status(500).json({ message: 'Internal server error during user creation access check.' });
  }
};

// Special permission checker for User Rights module
const checkUserRightsAccess = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Only Admin can manage User Rights
    if (user.role !== 'Admin') {
      return res.status(403).json({ 
        message: 'Forbidden: Only Admin can manage User Rights.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('User rights access check error:', error);
    res.status(500).json({ message: 'Internal server error during user rights access check.' });
  }
};

module.exports = {
  hasMasterAccess,
  checkModulePermission,
  checkBranchAccess,
  checkUserCreationAccess,
  checkUserRightsAccess
};
