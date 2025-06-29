const express = require('express');
const DocumentController = require('../controllers/documentController');
const { documentValidation } = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/documents/stats
 * @desc    Get document statistics
 * @access  Public (will be protected later)
 * @query   owner_id - Optional filter by owner
 */
router.get('/stats', DocumentController.getDocumentStats);

/**
 * @route   GET /api/documents
 * @desc    Get all documents with optional filtering and pagination
 * @access  Public (will be protected later)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   owner_id - Filter by owner
 * @query   classification - Filter by classification level (1-4)
 * @query   search - Search in title and content
 */
router.get('/', 
  documentValidation.query,
  DocumentController.getAllDocuments
);

/**
 * @route   POST /api/documents
 * @desc    Create a new document
 * @access  Public (will be protected later)
 * @body    title, content, classification (optional), owner_id (optional)
 */
router.post('/',
  documentValidation.create,
  DocumentController.createDocument
);

/**
 * @route   GET /api/documents/:id
 * @desc    Get single document by ID
 * @access  Public (will be protected later)
 * @params  id - Document UUID
 */
router.get('/:id',
  documentValidation.getById,
  DocumentController.getDocumentById
);

/**
 * @route   PUT /api/documents/:id
 * @desc    Update document by ID
 * @access  Public (will be protected later)
 * @params  id - Document UUID
 * @body    title (optional), content (optional), classification (optional)
 */
router.put('/:id',
  documentValidation.update,
  DocumentController.updateDocument
);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete document by ID (soft delete)
 * @access  Public (will be protected later)
 * @params  id - Document UUID
 */
router.delete('/:id',
  documentValidation.delete,
  DocumentController.deleteDocument
);

module.exports = router;
