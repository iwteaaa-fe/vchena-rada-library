const express = require('express');
const router = express.Router();
const { uploadDocument, getAllDocuments, deleteDocument, updateDocument, uploadMiddleware } = require('../controllers/documentController');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', protect, getAllDocuments);
router.post('/', protect, uploadMiddleware.single('file'), uploadDocument);
router.put('/:id', protect, isAdmin, updateDocument);
router.delete('/:id', protect, isAdmin, deleteDocument);

module.exports = router;