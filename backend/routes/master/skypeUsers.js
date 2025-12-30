const express = require('express');
const router = express.Router();
const { checkModulePermission } = require('../../middleware/masterAuth');
const MasterSkypeUser = require('../../models/MasterSkypeUser');

// Apply permission middleware to all routes
router.use(checkModulePermission('employees', 'view'));

// Get all Skype users
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, userType, role, accountStatus, branch } = req.query;
    const user = req.user;
    
    let filter = {};
    
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    }
    
    if (userType) filter.userType = userType;
    if (role) filter.role = role;
    if (accountStatus) filter.accountStatus = accountStatus;
    
    if (search) {
      filter.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { skypeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skypeUsers = await MasterSkypeUser.find(filter)
      .populate('branchId', 'name city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MasterSkypeUser.countDocuments(filter);
    
    res.json({
      skypeUsers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get Skype users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create Skype user
router.post('/', checkModulePermission('employees', 'create'), async (req, res) => {
  try {
    const skypeUser = new MasterSkypeUser({
      ...req.body,
      createdBy: req.user._id,
      branchId: req.user.role === 'Branch Admin' ? req.user.branchId : req.body.branchId
    });
    
    await skypeUser.save();
    res.status(201).json(skypeUser);
  } catch (error) {
    console.error('Create Skype user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update Skype user
router.put('/:id', checkModulePermission('employees', 'edit'), async (req, res) => {
  try {
    const skypeUser = await MasterSkypeUser.findById(req.params.id);
    if (!skypeUser) {
      return res.status(404).json({ message: 'Skype user not found' });
    }
    
    if (req.user.role === 'Branch Admin' && skypeUser.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot edit Skype user from other branch' });
    }
    
    Object.assign(skypeUser, req.body);
    await skypeUser.save();
    res.json(skypeUser);
  } catch (error) {
    console.error('Update Skype user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete Skype user
router.delete('/:id', checkModulePermission('employees', 'delete'), async (req, res) => {
  try {
    const skypeUser = await MasterSkypeUser.findById(req.params.id);
    if (!skypeUser) {
      return res.status(404).json({ message: 'Skype user not found' });
    }
    
    if (req.user.role === 'Branch Admin' && skypeUser.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot delete Skype user from other branch' });
    }
    
    await MasterSkypeUser.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skype user deleted successfully' });
  } catch (error) {
    console.error('Delete Skype user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
