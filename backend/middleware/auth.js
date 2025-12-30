const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('branch');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user not active.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Access denied. User not authenticated.' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        required: roles,
        current: req.user.role
      });
    }
    next();
  };
};

const sameBranch = (req, res, next) => {
  if (req.user.role === 'Admin') {
    return next();
  }
  
  // For branch-specific operations, ensure user is accessing their own branch
  if (req.user.branch._id.toString() !== req.params.branchId && 
      req.user.branch._id.toString() !== req.body.branch) {
    return res.status(403).json({ 
      message: 'Access denied. You can only access your branch data.' 
    });
  }
  
  next();
};

module.exports = { auth, authorize, sameBranch };
