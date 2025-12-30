const express = require('express');
const router = express.Router();
const { checkModulePermission } = require('../../middleware/masterAuth');
const MasterMaterial = require('../../models/MasterMaterial');

// Apply permission middleware to all routes
router.use(checkModulePermission('materials', 'view'));

// Get all materials
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, materialType, category, subject, course, semester, status } = req.query;
    const user = req.user;
    
    let filter = {};
    
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    }
    
    if (materialType) filter.materialType = materialType;
    if (category) filter.category = category;
    if (subject) filter.subject = subject;
    if (course) filter.course = course;
    if (semester) filter.semester = semester;
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const materials = await MasterMaterial.find(filter)
      .populate('subject', 'name code')
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MasterMaterial.countDocuments(filter);
    
    res.json({
      materials,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create material
router.post('/', checkModulePermission('materials', 'create'), async (req, res) => {
  try {
    const material = new MasterMaterial({
      ...req.body,
      createdBy: req.user._id,
      branchId: req.user.role === 'Branch Admin' ? req.user.branchId : req.body.branchId
    });
    
    await material.save();
    res.status(201).json(material);
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update material
router.put('/:id', checkModulePermission('materials', 'edit'), async (req, res) => {
  try {
    const material = await MasterMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    if (req.user.role === 'Branch Admin' && material.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot edit material from other branch' });
    }
    
    Object.assign(material, req.body);
    await material.save();
    res.json(material);
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete material
router.delete('/:id', checkModulePermission('materials', 'delete'), async (req, res) => {
  try {
    const material = await MasterMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    if (req.user.role === 'Branch Admin' && material.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot delete material from other branch' });
    }
    
    await MasterMaterial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
