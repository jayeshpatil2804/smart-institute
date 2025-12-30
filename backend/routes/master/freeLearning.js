const express = require('express');
const router = express.Router();
const { checkModulePermission } = require('../../middleware/masterAuth');
const MasterFreeLearning = require('../../models/MasterFreeLearning');

// Apply permission middleware to all routes
router.use(checkModulePermission('materials', 'view'));

// Get all free learning resources
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, resourceType, category, difficulty, status } = req.query;
    const user = req.user;
    
    let filter = {};
    
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    }
    
    if (resourceType) filter.resourceType = resourceType;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const resources = await MasterFreeLearning.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MasterFreeLearning.countDocuments(filter);
    
    res.json({
      resources,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get free learning resources error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create free learning resource
router.post('/', checkModulePermission('materials', 'create'), async (req, res) => {
  try {
    const resource = new MasterFreeLearning({
      ...req.body,
      createdBy: req.user._id,
      branchId: req.user.role === 'Branch Admin' ? req.user.branchId : req.body.branchId
    });
    
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    console.error('Create free learning resource error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update free learning resource
router.put('/:id', checkModulePermission('materials', 'edit'), async (req, res) => {
  try {
    const resource = await MasterFreeLearning.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    if (req.user.role === 'Branch Admin' && resource.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot edit resource from other branch' });
    }
    
    Object.assign(resource, req.body);
    await resource.save();
    res.json(resource);
  } catch (error) {
    console.error('Update free learning resource error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete free learning resource
router.delete('/:id', checkModulePermission('materials', 'delete'), async (req, res) => {
  try {
    const resource = await MasterFreeLearning.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    if (req.user.role === 'Branch Admin' && resource.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot delete resource from other branch' });
    }
    
    await MasterFreeLearning.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete free learning resource error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
