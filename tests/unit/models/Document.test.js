const Document = require('../../../src/models/Document');
const db = require('../../../src/config/database');
const { CLASSIFICATION_LEVELS, TABLES } = require('../../../src/utils/constants');

// Test database cleanup helper
const cleanupDatabase = async () => {
  await db(TABLES.DOCUMENTS).del();
};

// Sample document data for testing
const sampleDocument = {
  title: 'Test Document',
  content: 'This is test content for our document',
  classification: CLASSIFICATION_LEVELS.INTERNAL,
  owner_id: 'test-user-1'
};

const sampleDocument2 = {
  title: 'Another Test Document',
  content: 'Different content for testing',
  classification: CLASSIFICATION_LEVELS.PUBLIC,
  owner_id: 'test-user-2'
};

describe('Document Model', () => {
  // Setup and teardown
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await db.destroy(); // Close database connection
  });

  describe('create()', () => {
    it('should create a new document with valid data', async () => {
      const document = await Document.create(sampleDocument);

      expect(document).toBeDefined();
      expect(document.id).toBeDefined();
      expect(document.title).toBe(sampleDocument.title);
      expect(document.content).toBe(sampleDocument.content);
      expect(document.classification).toBe(sampleDocument.classification);
      expect(document.owner_id).toBe(sampleDocument.owner_id);
      expect(document.classification_name).toBe('INTERNAL');
      expect(document.created_at).toBeDefined();
      expect(document.updated_at).toBeDefined();
    });

    it('should create document with default classification if not provided', async () => {
      const documentData = { ...sampleDocument };
      delete documentData.classification;

      const document = await Document.create(documentData);

      expect(document.classification).toBe(CLASSIFICATION_LEVELS.INTERNAL);
      expect(document.classification_name).toBe('INTERNAL');
    });

    it('should throw error if required fields are missing', async () => {
      // Missing title
      await expect(Document.create({
        content: 'Test content',
        owner_id: 'test-user'
      })).rejects.toThrow();

      // Missing content
      await expect(Document.create({
        title: 'Test Title',
        owner_id: 'test-user'
      })).rejects.toThrow();

      // Missing owner_id
      await expect(Document.create({
        title: 'Test Title',
        content: 'Test content'
      })).rejects.toThrow();
    });
  });

  describe('findById()', () => {
    it('should find document by valid ID', async () => {
      const createdDocument = await Document.create(sampleDocument);
      const foundDocument = await Document.findById(createdDocument.id);

      expect(foundDocument).toBeDefined();
      expect(foundDocument.id).toBe(createdDocument.id);
      expect(foundDocument.title).toBe(sampleDocument.title);
      expect(foundDocument.classification_name).toBe('INTERNAL');
    });

    it('should return null for non-existent document', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
      const document = await Document.findById(nonExistentId);

      expect(document).toBeNull();
    });

    it('should return null for soft-deleted document', async () => {
      const createdDocument = await Document.create(sampleDocument);
      await Document.delete(createdDocument.id);
      
      const foundDocument = await Document.findById(createdDocument.id);
      expect(foundDocument).toBeNull();
    });
  });

  describe('findAll()', () => {
    beforeEach(async () => {
      await Document.create(sampleDocument);
      await Document.create(sampleDocument2);
    });

    it('should return all documents when no filters applied', async () => {
      const documents = await Document.findAll();

      expect(documents).toHaveLength(2);
      expect(documents[0].classification_name).toBeDefined();
    });

    it('should filter documents by owner_id', async () => {
      const documents = await Document.findAll({ owner_id: 'test-user-1' });

      expect(documents).toHaveLength(1);
      expect(documents[0].owner_id).toBe('test-user-1');
      expect(documents[0].title).toBe(sampleDocument.title);
    });

    it('should filter documents by classification', async () => {
      const documents = await Document.findAll({ 
        classification: CLASSIFICATION_LEVELS.PUBLIC 
      });

      expect(documents).toHaveLength(1);
      expect(documents[0].classification).toBe(CLASSIFICATION_LEVELS.PUBLIC);
      expect(documents[0].classification_name).toBe('PUBLIC');
    });

    it('should search documents by title and content', async () => {
      const documents = await Document.findAll({ search: 'Another' });

      expect(documents).toHaveLength(1);
      expect(documents[0].title).toContain('Another');
    });

    it('should support pagination with limit and offset', async () => {
      // Create one more document for pagination test
      await Document.create({
        ...sampleDocument,
        title: 'Third Document',
        owner_id: 'test-user-3'
      });

      const firstPage = await Document.findAll({ limit: 2, offset: 0 });
      const secondPage = await Document.findAll({ limit: 2, offset: 2 });

      expect(firstPage).toHaveLength(2);
      expect(secondPage).toHaveLength(1);
    });

    it('should exclude soft-deleted documents', async () => {
      const document = await Document.create({
        ...sampleDocument,
        title: 'To be deleted'
      });
      
      await Document.delete(document.id);
      const documents = await Document.findAll();

      expect(documents).toHaveLength(2); // Should not include deleted document
      expect(documents.find(d => d.id === document.id)).toBeUndefined();
    });
  });

  describe('update()', () => {
    let documentId;

    beforeEach(async () => {
      const document = await Document.create(sampleDocument);
      documentId = document.id;
    });

    it('should update document with valid data', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        classification: CLASSIFICATION_LEVELS.CONFIDENTIAL
      };

      const updatedDocument = await Document.update(documentId, updateData);

      expect(updatedDocument).toBeDefined();
      expect(updatedDocument.title).toBe('Updated Title');
      expect(updatedDocument.content).toBe('Updated content');
      expect(updatedDocument.classification).toBe(CLASSIFICATION_LEVELS.CONFIDENTIAL);
      expect(updatedDocument.classification_name).toBe('CONFIDENTIAL');
    });

    it('should update only provided fields', async () => {
      const updateData = { title: 'Only Title Updated' };
      const updatedDocument = await Document.update(documentId, updateData);

      expect(updatedDocument.title).toBe('Only Title Updated');
      expect(updatedDocument.content).toBe(sampleDocument.content); // Unchanged
      expect(updatedDocument.classification).toBe(sampleDocument.classification); // Unchanged
    });

    it('should return null for non-existent document', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
      const result = await Document.update(nonExistentId, { title: 'New Title' });

      expect(result).toBeNull();
    });

    it('should ignore invalid fields', async () => {
      const updateData = {
        title: 'Valid Title',
        invalidField: 'Should be ignored',
        owner_id: 'Should be ignored' // owner_id updates not allowed
      };

      const updatedDocument = await Document.update(documentId, updateData);

      expect(updatedDocument.title).toBe('Valid Title');
      expect(updatedDocument.owner_id).toBe(sampleDocument.owner_id); // Unchanged
    });
  });

  describe('delete()', () => {
    let documentId;

    beforeEach(async () => {
      const document = await Document.create(sampleDocument);
      documentId = document.id;
    });

    it('should soft delete document', async () => {
      const deleted = await Document.delete(documentId);

      expect(deleted).toBe(true);

      // Document should not be found by normal queries
      const foundDocument = await Document.findById(documentId);
      expect(foundDocument).toBeNull();

      // But should exist in database with deleted_at timestamp
      const deletedDocument = await db(TABLES.DOCUMENTS)
        .where('id', documentId)
        .first();
      expect(deletedDocument).toBeDefined();
      expect(deletedDocument.deleted_at).toBeDefined();
    });

    it('should return false for non-existent document', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
      const deleted = await Document.delete(nonExistentId);

      expect(deleted).toBe(false);
    });

    it('should return false for already deleted document', async () => {
      await Document.delete(documentId);
      const deletedAgain = await Document.delete(documentId);

      expect(deletedAgain).toBe(false);
    });
  });

  describe('count()', () => {
    beforeEach(async () => {
      await Document.create(sampleDocument);
      await Document.create(sampleDocument2);
      await Document.create({
        ...sampleDocument,
        title: 'Third Document',
        owner_id: 'test-user-3'
      });
    });

    it('should count all documents', async () => {
      const count = await Document.count();
      expect(count).toBe(3);
    });

    it('should count with filters', async () => {
      const count = await Document.count({ owner_id: 'test-user-1' });
      expect(count).toBe(1);
    });

    it('should exclude soft-deleted documents from count', async () => {
      const document = await Document.create({
        ...sampleDocument,
        title: 'To be deleted'
      });
      
      await Document.delete(document.id);
      const count = await Document.count();

      expect(count).toBe(3); // Should not count deleted document
    });
  });
});
