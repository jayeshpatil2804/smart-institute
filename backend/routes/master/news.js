const express = require('express');
const router = express.Router();
const { checkModulePermission, checkBranchAccess } = require('../../middleware/masterAuth');
const MasterNews = require('../../models/MasterNews');
const MasterEmployee = require('../../models/MasterEmployee');

// Apply permission middleware to all routes
router.use(checkModulePermission('news', 'view'));

// Get all news with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, category, priority, status, isPublished, branch } = req.query;
    const user = req.user;
    
    // Build filter
    let filter = {};
    
    // Branch Admin can only see their own branch news
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    } else if (branch) {
      filter.branchId = branch;
    }
    
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    
    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const news = await MasterNews.find(filter)
      .populate('author', 'firstName lastName email')
      .populate('branchId', 'name city')
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MasterNews.countDocuments(filter);
    
    res.json({
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single news
router.get('/:id', async (req, res) => {
  try {
    const news = await MasterNews.findById(req.params.id)
      .populate('author', 'firstName lastName email employeeId')
      .populate('branchId', 'name city state')
      .populate('targetBranches', 'name city')
      .populate('targetCourses', 'name code');
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && news.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot access news from other branch' });
    }
    
    res.json(news);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new news
router.post('/', checkModulePermission('news', 'create'), async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      category,
      priority,
      featuredImage,
      images,
      attachments,
      publishDate,
      expiryDate,
      isScheduled,
      targetAudience,
      targetBranches,
      targetCourses,
      targetSemesters,
      tags,
      metaTitle,
      metaDescription,
      keywords,
      author,
      authorName,
      allowComments,
      sendNotification,
      branchId
    } = req.body;
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && branchId !== req.user.branchId.toString()) {
      return res.status(403).json({ 
        message: 'Forbidden: Branch Admin can only create news for their own branch' 
      });
    }
    
    const news = new MasterNews({
      title,
      slug,
      summary,
      content,
      category,
      priority,
      featuredImage,
      images: images || [],
      attachments: attachments || [],
      publishDate: publishDate || new Date(),
      expiryDate,
      isScheduled: isScheduled || false,
      targetAudience,
      targetBranches: targetBranches || [],
      targetCourses: targetCourses || [],
      targetSemesters: targetSemesters || [],
      tags: tags || [],
      metaTitle,
      metaDescription,
      keywords: keywords || [],
      author,
      authorName,
      allowComments: allowComments || false,
      sendNotification: sendNotification || false,
      createdBy: req.user._id,
      branchId
    });
    
    await news.save();
    
    const populatedNews = await MasterNews.findById(news._id)
      .populate('author', 'firstName lastName email')
      .populate('branchId', 'name city');
    
    res.status(201).json(populatedNews);
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update news
router.put('/:id', checkModulePermission('news', 'edit'), async (req, res) => {
  try {
    const news = await MasterNews.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && news.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot edit news from other branch' });
    }
    
    const {
      title,
      summary,
      content,
      category,
      priority,
      featuredImage,
      images,
      attachments,
      publishDate,
      expiryDate,
      isScheduled,
      targetAudience,
      targetBranches,
      targetCourses,
      targetSemesters,
      tags,
      metaTitle,
      metaDescription,
      keywords,
      author,
      authorName,
      allowComments,
      sendNotification,
      status,
      isPublished
    } = req.body;
    
    // Update slug if title changed
    if (title && title !== news.title) {
      news.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }
    
    // Update news
    Object.assign(news, {
      title,
      summary,
      content,
      category,
      priority,
      featuredImage,
      images,
      attachments,
      publishDate,
      expiryDate,
      isScheduled,
      targetAudience,
      targetBranches,
      targetCourses,
      targetSemesters,
      tags,
      metaTitle,
      metaDescription,
      keywords,
      author,
      authorName,
      allowComments,
      sendNotification,
      status,
      isPublished
    });
    
    // Set published date and publisher if publishing
    if (isPublished && !news.isPublished) {
      news.publishedAt = new Date();
      news.publishedBy = req.user._id;
    }
    
    await news.save();
    
    const populatedNews = await MasterNews.findById(news._id)
      .populate('author', 'firstName lastName email')
      .populate('branchId', 'name city');
    
    res.json(populatedNews);
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete news
router.delete('/:id', checkModulePermission('news', 'delete'), async (req, res) => {
  try {
    const news = await MasterNews.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && news.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot delete news from other branch' });
    }
    
    await MasterNews.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Publish news
router.post('/:id/publish', checkModulePermission('news', 'edit'), async (req, res) => {
  try {
    const news = await MasterNews.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && news.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot publish news from other branch' });
    }
    
    news.isPublished = true;
    news.publishedAt = new Date();
    news.publishedBy = req.user._id;
    news.status = 'Published';
    
    await news.save();
    
    res.json({ message: 'News published successfully' });
  } catch (error) {
    console.error('Publish news error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unpublish news
router.post('/:id/unpublish', checkModulePermission('news', 'edit'), async (req, res) => {
  try {
    const news = await MasterNews.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && news.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot unpublish news from other branch' });
    }
    
    news.isPublished = false;
    news.status = 'Draft';
    
    await news.save();
    
    res.json({ message: 'News unpublished successfully' });
  } catch (error) {
    console.error('Unpublish news error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get published news for public display
router.get('/published/list', async (req, res) => {
  try {
    const { limit = 10, page = 1, category } = req.query;
    const skip = (page - 1) * limit;
    
    let filter = { isPublished: true, status: 'Published' };
    
    if (category) filter.category = category;
    
    const news = await MasterNews.find(filter)
      .populate('author', 'firstName lastName')
      .populate('branchId', 'name city')
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await MasterNews.countDocuments(filter);
    
    res.json({
      news,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get published news error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
