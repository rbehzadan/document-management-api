const db = require('../config/database');
const { TABLES, CLASSIFICATION_LEVELS, CLASSIFICATION_NAMES } = require('../utils/constants');

class Document {
  /**
   * Get all documents with optional filtering
   * @param {Object} filters - Filter options
   * @param {string} filters.owner_id - Filter by owner
   * @param {number} filters.classification - Filter by classification level
   * @param {string} filters.search - Search in title and content
   * @param {number} filters.limit - Limit results
   * @param {number} filters.offset - Offset for pagination
   * @returns {Promise<Array>} Array of documents
   */
  static async findAll(filters = {}) {
    let query = db(TABLES.DOCUMENTS)
      .select(
        'id',
        'title',
        'content',
        'classification',
        'owner_id',
        'created_at',
        'updated_at'
      )
      .whereNull('deleted_at') // Exclude soft-deleted documents
      .orderBy('updated_at', 'desc');

    // Apply filters
    if (filters.owner_id) {
      query = query.where('owner_id', filters.owner_id);
    }

    if (filters.classification) {
      query = query.where('classification', filters.classification);
    }

    if (filters.search) {
      query = query.where(function() {
        this.whereILike('title', `%${filters.search}%`)
            .orWhereILike('content', `%${filters.search}%`);
      });
    }

    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const documents = await query;
    
    // Add classification name for easier reading
    return documents.map(doc => ({
      ...doc,
      classification_name: CLASSIFICATION_NAMES[doc.classification]
    }));
  }

  /**
   * Find document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>} Document or null if not found
   */
  static async findById(id) {
    const document = await db(TABLES.DOCUMENTS)
      .select(
        'id',
        'title',
        'content', 
        'classification',
        'owner_id',
        'created_at',
        'updated_at'
      )
      .where('id', id)
      .whereNull('deleted_at')
      .first();

    if (!document) {
      return null;
    }

    return {
      ...document,
      classification_name: CLASSIFICATION_NAMES[document.classification]
    };
  }

  /**
   * Create a new document
   * @param {Object} documentData - Document data
   * @param {string} documentData.title - Document title
   * @param {string} documentData.content - Document content
   * @param {number} documentData.classification - Classification level
   * @param {string} documentData.owner_id - Owner ID
   * @returns {Promise<Object>} Created document
   */
  static async create(documentData) {
    const { title, content, classification = CLASSIFICATION_LEVELS.INTERNAL, owner_id } = documentData;

    const [document] = await db(TABLES.DOCUMENTS)
      .insert({
        title,
        content,
        classification,
        owner_id
      })
      .returning([
        'id',
        'title',
        'content',
        'classification',
        'owner_id',
        'created_at',
        'updated_at'
      ]);

    return {
      ...document,
      classification_name: CLASSIFICATION_NAMES[document.classification]
    };
  }

  /**
   * Update document by ID
   * @param {string} id - Document ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated document or null if not found
   */
  static async update(id, updateData) {
    const allowedFields = ['title', 'content', 'classification'];
    const filteredData = {};
    
    // Only include allowed fields
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      return this.findById(id);
    }

    const [document] = await db(TABLES.DOCUMENTS)
      .where('id', id)
      .whereNull('deleted_at')
      .update({
        ...filteredData,
        updated_at: db.fn.now()
      })
      .returning([
        'id',
        'title',
        'content',
        'classification', 
        'owner_id',
        'created_at',
        'updated_at'
      ]);

    if (!document) {
      return null;
    }

    return {
      ...document,
      classification_name: CLASSIFICATION_NAMES[document.classification]
    };
  }

  /**
   * Soft delete document by ID
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async delete(id) {
    const result = await db(TABLES.DOCUMENTS)
      .where('id', id)
      .whereNull('deleted_at')
      .update({
        deleted_at: db.fn.now()
      });

    return result > 0;
  }

  /**
   * Hard delete document by ID (for testing/admin purposes)
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async hardDelete(id) {
    const result = await db(TABLES.DOCUMENTS)
      .where('id', id)
      .del();

    return result > 0;
  }

  /**
   * Get document count for pagination
   * @param {Object} filters - Same filters as findAll
   * @returns {Promise<number>} Total count
   */
  static async count(filters = {}) {
    let query = db(TABLES.DOCUMENTS)
      .whereNull('deleted_at');

    // Apply same filters as findAll
    if (filters.owner_id) {
      query = query.where('owner_id', filters.owner_id);
    }

    if (filters.classification) {
      query = query.where('classification', filters.classification);
    }

    if (filters.search) {
      query = query.where(function() {
        this.whereILike('title', `%${filters.search}%`)
            .orWhereILike('content', `%${filters.search}%`);
      });
    }

    const result = await query.count('id as count').first();
    return parseInt(result.count);
  }
}

module.exports = Document;
