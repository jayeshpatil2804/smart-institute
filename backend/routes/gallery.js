const express = require('express');
const multer = require('multer');
const router = express.Router();

const { auth, authorize } = require('../middleware/auth');
const {
  addImage,
  getAllImages,
  getImagesByBranch,
  updateImage,
  deleteImage,
  getGalleryStats
} = require('../controllers/gallery.controller');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
    }
  }
});

// Public routes
router.get('/', getAllImages);
router.get('/branch/:branchId', getImagesByBranch);
router.get('/stats', getGalleryStats);

// Protected routes - Admin and Branch Admin only
router.post('/', auth, authorize('Admin', 'Branch Admin'), upload.single('image'), addImage);
router.put('/:id', auth, authorize('Admin', 'Branch Admin'), updateImage);
router.delete('/:id', auth, authorize('Admin', 'Branch Admin'), deleteImage);

module.exports = router;
