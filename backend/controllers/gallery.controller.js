const Gallery = require('../models/Gallery');
const Branch = require('../models/Branch');
const fs = require('fs');
const path = require('path');

// Helper function to ensure upload directory exists
const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Add gallery image
const addImage = async (req, res) => {
  try {
    const { title, description, branchId, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only JPG, PNG, and WEBP images are allowed' });
    }

    // Validate file size (25MB max)
    const maxSize = 25 * 1024 * 1024; // 25MB in bytes
    if (req.file.size > maxSize) {
      return res.status(400).json({ message: 'Image size must be less than 25MB' });
    }

    // Validate branch
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Generate unique filename
    const filename = `gallery_${Date.now()}_${req.file.originalname}`;
    const uploadDir = path.join(__dirname, '../uploads/gallery');
    ensureUploadDir(uploadDir);

    const imagePath = path.join(uploadDir, filename);
    fs.writeFileSync(imagePath, req.file.buffer);

    // Save to database
    const galleryImage = new Gallery({
      title,
      description,
      imageUrl: `/uploads/gallery/${filename}`,
      branchId,
      createdBy: req.user._id,
      category: category || 'Other'
    });

    await galleryImage.save();
    await galleryImage.populate('branchId', 'name address');
    await galleryImage.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      message: 'Image uploaded successfully',
      galleryImage
    });
  } catch (error) {
    console.error('Error adding gallery image:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
};

// Get all gallery images (public)
const getAllImages = async (req, res) => {
  try {
    const { category, branchId, page = 1, limit = 20 } = req.query;
    
    let query = { isActive: true };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (branchId) {
      query.branchId = branchId;
    }

    const skip = (page - 1) * limit;
    
    const images = await Gallery.find(query)
      .populate('branchId', 'name address')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Gallery.countDocuments(query);

    res.json({
      images,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({ message: 'Failed to fetch images' });
  }
};

// Get images by branch
const getImagesByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { category, page = 1, limit = 20 } = req.query;

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    let query = { branchId, isActive: true };
    
    if (category && category !== 'All') {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    
    const images = await Gallery.find(query)
      .populate('branchId', 'name address')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Gallery.countDocuments(query);

    res.json({
      branch,
      images,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching branch gallery images:', error);
    res.status(500).json({ message: 'Failed to fetch images' });
  }
};

// Update gallery image
const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;

    const galleryImage = await Gallery.findById(id);
    if (!galleryImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Check permissions
    if (req.user.role === 'Branch Admin' && 
        galleryImage.branchId.toString() !== req.user.branch._id.toString()) {
      return res.status(403).json({ message: 'You can only edit images from your branch' });
    }

    // Update fields
    if (title) galleryImage.title = title;
    if (description !== undefined) galleryImage.description = description;
    if (category) galleryImage.category = category;

    await galleryImage.save();
    await galleryImage.populate('branchId', 'name address');
    await galleryImage.populate('createdBy', 'firstName lastName');

    res.json({
      message: 'Image updated successfully',
      galleryImage
    });
  } catch (error) {
    console.error('Error updating gallery image:', error);
    res.status(500).json({ message: 'Failed to update image' });
  }
};

// Delete gallery image
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const galleryImage = await Gallery.findById(id);
    if (!galleryImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Check permissions
    if (req.user.role === 'Branch Admin' && 
        galleryImage.branchId.toString() !== req.user.branch._id.toString()) {
      return res.status(403).json({ message: 'You can only delete images from your branch' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '..', galleryImage.imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await Gallery.findByIdAndDelete(id);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
};

// Get gallery statistics
const getGalleryStats = async (req, res) => {
  try {
    const { branchId } = req.query;
    
    let matchQuery = { isActive: true };
    if (branchId) {
      matchQuery.branchId = new mongoose.Types.ObjectId(branchId);
    }

    const stats = await Gallery.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalImages: { $sum: 1 },
          byCategory: {
            $push: {
              category: '$category',
              count: 1
            }
          },
          byBranch: {
            $push: {
              branchId: '$branchId',
              count: 1
            }
          }
        }
      }
    ]);

    const categoryStats = {};
    if (stats.length > 0) {
      stats[0].byCategory.forEach(item => {
        categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
      });
    }

    res.json({
      totalImages: stats.length > 0 ? stats[0].totalImages : 0,
      categoryStats
    });
  } catch (error) {
    console.error('Error fetching gallery stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};

module.exports = {
  addImage,
  getAllImages,
  getImagesByBranch,
  updateImage,
  deleteImage,
  getGalleryStats
};
