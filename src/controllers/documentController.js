const { validationResult } = require('express-validator');
const Document = require('../models/Document');
const { HTTP_STATUS, CLASSIFICATION_LEVELS } = require('../utils/constants');
const logger = require('../utils/logger');

class DocumentController {
  /**
   * Get all documents with optional filtering and pagination
   * GET /api/documents
   */
  static async getAllDocuments(req, res, next) {
    try {
      // Check for validation errors first
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Validation failed',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
      }

      const {
        owner_id,
        classification,
        search,
        page = 1,
        limit = 10
      } = req.query;

      // Parse pagination
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per page
      const offset = (pageNum - 1) * limitNum;

      // Build filters
      const filters = {
        limit: limitNum,
        offset
      };

      if (owner_id) filters.owner_id = owner_id;
      if (classification) filters.classification = parseInt(classification);
      if (search && search.trim()) filters.search = search.trim();

      // Get documents and total count
      const [documents, totalCount] = await Promise.all([
        Document.findAll(filters),
        Document.count(filters)
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limitNum);
      const hasNext = pageNum < totalPages;
      const hasPrev = pageNum > 1;

      res.status(HTTP_STATUS.OK).json({
        data: documents,
        meta: {
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            totalPages,
            hasNext,
            hasPrev
          }
        },
        timestamp: new Date().toISOString()
      });

      logger.info(`Retrieved ${documents.length} documents for filters:`, filters);
    } catch (error) {
      logger.error('Error getting documents:', error);
      next(error);
    }
  }

  /**
   * Get single document by ID
   * GET /api/documents/:id
   */
  static async getDocumentById(req, res, next) {
    try {
      // Check for validation errors first
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Validation failed',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
      }

      const { id } = req.params;

      const document = await Document.findById(id);

      if (!document) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Document not found',
          message: `Document with ID ${id} does not exist`,
          timestamp: new Date().toISOString()
        });
      }

      res.status(HTTP_STATUS.OK).json({
        data: document,
        timestamp: new Date().toISOString()
      });

      logger.info(`Retrieved document ${id}`);
    } catch (error) {
      logger.error(`Error getting document ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Create new document
   * POST /api/documents
   */
  static async createDocument(req, res, next) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Validation failed',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
      }

      const { title, content, classification = CLASSIFICATION_LEVELS.INTERNAL } = req.body;
      
      // For now, we'll use a dummy owner_id since we don't have auth yet
      // This will be replaced with req.user.id once auth is implemented
      const owner_id = req.body.owner_id || 'temp-user-1';

      const documentData = {
        title,
        content,
        classification,
        owner_id
      };

      const document = await Document.create(documentData);

      res.status(HTTP_STATUS.CREATED).json({
        data: document,
        message: 'Document created successfully',
        timestamp: new Date().toISOString()
      });

      logger.info(`Created document ${document.id} by owner ${owner_id}`);
    } catch (error) {
      logger.error('Error creating document:', error);
      next(error);
    }
  }

  /**
   * Update document by ID
   * PUT /api/documents/:id
   */
  static async updateDocument(req, res, next) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Validation failed',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
      }

      const { id } = req.params;
      const { title, content, classification } = req.body;

      // Build update data
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (classification !== undefined) updateData.classification = classification;

      if (Object.keys(updateData).length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'No valid fields to update',
          message: 'At least one of title, content, or classification must be provided',
          timestamp: new Date().toISOString()
        });
      }

      const document = await Document.update(id, updateData);

      if (!document) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Document not found',
          message: `Document with ID ${id} does not exist`,
          timestamp: new Date().toISOString()
        });
      }

      res.status(HTTP_STATUS.OK).json({
        data: document,
        message: 'Document updated successfully',
        timestamp: new Date().toISOString()
      });

      logger.info(`Updated document ${id}`);
    } catch (error) {
      logger.error(`Error updating document ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Delete document by ID (soft delete)
   * DELETE /api/documents/:id
   */
  static async deleteDocument(req, res, next) {
    try {
      // Check for validation errors first
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Validation failed',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
      }

      const { id } = req.params;

      const deleted = await Document.delete(id);

      if (!deleted) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Document not found',
          message: `Document with ID ${id} does not exist`,
          timestamp: new Date().toISOString()
        });
      }

      res.status(HTTP_STATUS.NO_CONTENT).send();

      logger.info(`Deleted document ${id}`);
    } catch (error) {
      logger.error(`Error deleting document ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get document statistics
   * GET /api/documents/stats
   */
  static async getDocumentStats(req, res, next) {
    try {
      const { owner_id } = req.query;
      
      const filters = {};
      if (owner_id) filters.owner_id = owner_id;

      // Get counts by classification level
      const [total, publicCount, internalCount, confidentialCount, secretCount] = await Promise.all([
        Document.count(filters),
        Document.count({ ...filters, classification: CLASSIFICATION_LEVELS.PUBLIC }),
        Document.count({ ...filters, classification: CLASSIFICATION_LEVELS.INTERNAL }),
        Document.count({ ...filters, classification: CLASSIFICATION_LEVELS.CONFIDENTIAL }),
        Document.count({ ...filters, classification: CLASSIFICATION_LEVELS.SECRET })
      ]);

      const stats = {
        total,
        byClassification: {
          public: publicCount,
          internal: internalCount,
          confidential: confidentialCount,
          secret: secretCount
        }
      };

      res.status(HTTP_STATUS.OK).json({
        data: stats,
        timestamp: new Date().toISOString()
      });

      logger.info('Retrieved document statistics');
    } catch (error) {
      logger.error('Error getting document stats:', error);
      next(error);
    }
  }
}

module.exports = DocumentController;
