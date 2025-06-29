const request = require('supertest');
const app = require('../../../src/config/app');
const db = require('../../../src/config/database');
const { CLASSIFICATION_LEVELS, TABLES, HTTP_STATUS } = require('../../../src/utils/constants');

// Test database cleanup helper
const cleanupDatabase = async () => {
  await db(TABLES.DOCUMENTS).del();
};

// Sample test data
const validDocument = {
  title: 'Integration Test Document',
  content: 'This document is created during integration testing',
  classification: CLASSIFICATION_LEVELS.INTERNAL,
  owner_id: 'integration-test-user'
};

const publicDocument = {
  title: 'Public Document',
  content: 'This is a public document',
  classification: CLASSIFICATION_LEVELS.PUBLIC,
  owner_id: 'public-user'
};

describe('Documents API Integration Tests', () => {
  // Setup and teardown
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await db.destroy();
  });

  describe('POST /api/documents', () => {
    it('should create a new document with valid data', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send(validDocument)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.title).toBe(validDocument.title);
      expect(response.body.data.content).toBe(validDocument.content);
      expect(response.body.data.classification).toBe(validDocument.classification);
      expect(response.body.data.classification_name).toBe('INTERNAL');
      expect(response.body.data.owner_id).toBe(validDocument.owner_id);
      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.message).toBe('Document created successfully');
    });

    it('should create document with default classification when not provided', async () => {
      const documentWithoutClassification = { ...validDocument };
      delete documentWithoutClassification.classification;

      const response = await request(app)
        .post('/api/documents')
        .send(documentWithoutClassification)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body.data.classification).toBe(CLASSIFICATION_LEVELS.INTERNAL);
      expect(response.body.data.classification_name).toBe('INTERNAL');
    });

    it('should create document with default owner_id when not provided', async () => {
      const documentWithoutOwner = { ...validDocument };
      delete documentWithoutOwner.owner_id;

      const response = await request(app)
        .post('/api/documents')
        .send(documentWithoutOwner)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body.data.owner_id).toBe('temp-user-1');
    });

    it('should return validation error for missing title', async () => {
      const invalidDocument = { ...validDocument };
      delete invalidDocument.title;

      const response = await request(app)
        .post('/api/documents')
        .send(invalidDocument)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
      expect(response.body.details.some(d => d.path === 'title')).toBe(true);
    });

    it('should return validation error for missing content', async () => {
      const invalidDocument = { ...validDocument };
      delete invalidDocument.content;

      const response = await request(app)
        .post('/api/documents')
        .send(invalidDocument)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details.some(d => d.path === 'content')).toBe(true);
    });

    it('should return validation error for invalid classification', async () => {
      const invalidDocument = {
        ...validDocument,
        classification: 99 // Invalid classification level
      };

      const response = await request(app)
        .post('/api/documents')
        .send(invalidDocument)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details.some(d => d.path === 'classification')).toBe(true);
    });

    it('should sanitize HTML in title', async () => {
      const documentWithHTML = {
        ...validDocument,
        title: '<script>alert("xss")</script>Safe Title'
      };

      const response = await request(app)
        .post('/api/documents')
        .send(documentWithHTML)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body.data.title).not.toContain('<script>');
      expect(response.body.data.title).toContain('Safe Title');
    });
  });

  describe('GET /api/documents', () => {
    beforeEach(async () => {
      // Create test documents
      await request(app).post('/api/documents').send(validDocument);
      await request(app).post('/api/documents').send(publicDocument);
      await request(app).post('/api/documents').send({
        ...validDocument,
        title: 'Confidential Document',
        classification: CLASSIFICATION_LEVELS.CONFIDENTIAL,
        owner_id: 'confidential-user'
      });
    });

    it('should return all documents with default pagination', async () => {
      const response = await request(app)
        .get('/api/documents')
        .expect(HTTP_STATUS.OK);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(3);
      expect(response.body.meta.pagination).toBeDefined();
      expect(response.body.meta.pagination.page).toBe(1);
      expect(response.body.meta.pagination.limit).toBe(10);
      expect(response.body.meta.pagination.total).toBe(3);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/documents?page=1&limit=2')
        .expect(HTTP_STATUS.OK);

      expect(response.body.data.length).toBe(2);
      expect(response.body.meta.pagination.page).toBe(1);
      expect(response.body.meta.pagination.limit).toBe(2);
      expect(response.body.meta.pagination.hasNext).toBe(true);
      expect(response.body.meta.pagination.totalPages).toBe(2);
    });

    it('should filter by classification', async () => {
      const response = await request(app)
        .get(`/api/documents?classification=${CLASSIFICATION_LEVELS.PUBLIC}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].classification).toBe(CLASSIFICATION_LEVELS.PUBLIC);
      expect(response.body.data[0].classification_name).toBe('PUBLIC');
    });

    it('should filter by owner_id', async () => {
      const response = await request(app)
        .get('/api/documents?owner_id=public-user')
        .expect(HTTP_STATUS.OK);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].owner_id).toBe('public-user');
    });

    it('should search in title and content', async () => {
      const response = await request(app)
        .get('/api/documents?search=public')
        .expect(HTTP_STATUS.OK);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title.toLowerCase()).toContain('public');
    });

    it('should return validation error for invalid pagination', async () => {
      await request(app)
        .get('/api/documents?page=0')
        .expect(HTTP_STATUS.BAD_REQUEST);

      await request(app)
        .get('/api/documents?limit=0')
        .expect(HTTP_STATUS.BAD_REQUEST);

      await request(app)
        .get('/api/documents?limit=101')
        .expect(HTTP_STATUS.BAD_REQUEST);
    });
  });

  describe('GET /api/documents/:id', () => {
    let documentId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/documents')
        .send(validDocument);
      documentId = response.body.data.id;
    });

    it('should return document by valid ID', async () => {
      const response = await request(app)
        .get(`/api/documents/${documentId}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(documentId);
      expect(response.body.data.title).toBe(validDocument.title);
      expect(response.body.data.classification_name).toBe('INTERNAL');
    });

    it('should return 404 for non-existent document', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
      const response = await request(app)
        .get(`/api/documents/${nonExistentId}`)
        .expect(HTTP_STATUS.NOT_FOUND);

      expect(response.body.error).toBe('Document not found');
      expect(response.body.message).toContain(nonExistentId);
    });

    it('should return validation error for invalid UUID format', async () => {
      await request(app)
        .get('/api/documents/invalid-uuid')
        .expect(HTTP_STATUS.BAD_REQUEST);
    });
  });

  describe('PUT /api/documents/:id', () => {
    let documentId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/documents')
        .send(validDocument);
      documentId = response.body.data.id;
    });

    it('should update document with valid data', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        classification: CLASSIFICATION_LEVELS.CONFIDENTIAL
      };

      const response = await request(app)
        .put(`/api/documents/${documentId}`)
        .send(updateData)
        .expect(HTTP_STATUS.OK);

      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.content).toBe('Updated content');
      expect(response.body.data.classification).toBe(CLASSIFICATION_LEVELS.CONFIDENTIAL);
      expect(response.body.data.classification_name).toBe('CONFIDENTIAL');
      expect(response.body.message).toBe('Document updated successfully');
    });

    it('should update only provided fields', async () => {
      const updateData = { title: 'Only Title Updated' };

      const response = await request(app)
        .put(`/api/documents/${documentId}`)
        .send(updateData)
        .expect(HTTP_STATUS.OK);

      expect(response.body.data.title).toBe('Only Title Updated');
      expect(response.body.data.content).toBe(validDocument.content);
      expect(response.body.data.classification).toBe(validDocument.classification);
    });

    it('should return 404 for non-existent document', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
      const response = await request(app)
        .put(`/api/documents/${nonExistentId}`)
        .send({ title: 'Updated Title' })
        .expect(HTTP_STATUS.NOT_FOUND);

      expect(response.body.error).toBe('Document not found');
    });

    it('should return validation error for empty update', async () => {
      const response = await request(app)
        .put(`/api/documents/${documentId}`)
        .send({})
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body.error).toBe('No valid fields to update');
    });
  });

  describe('DELETE /api/documents/:id', () => {
    let documentId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/documents')
        .send(validDocument);
      documentId = response.body.data.id;
    });

    it('should delete document successfully', async () => {
      await request(app)
        .delete(`/api/documents/${documentId}`)
        .expect(HTTP_STATUS.NO_CONTENT);

      // Verify document is no longer accessible
      await request(app)
        .get(`/api/documents/${documentId}`)
        .expect(HTTP_STATUS.NOT_FOUND);
    });

    it('should return 404 for non-existent document', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
      const response = await request(app)
        .delete(`/api/documents/${nonExistentId}`)
        .expect(HTTP_STATUS.NOT_FOUND);

      expect(response.body.error).toBe('Document not found');
    });
  });

  describe('GET /api/documents/stats', () => {
    beforeEach(async () => {
      await request(app).post('/api/documents').send(validDocument);
      await request(app).post('/api/documents').send(publicDocument);
      await request(app).post('/api/documents').send({
        ...validDocument,
        title: 'Secret Document',
        classification: CLASSIFICATION_LEVELS.SECRET,
        owner_id: 'secret-user'
      });
    });

    it('should return document statistics', async () => {
      const response = await request(app)
        .get('/api/documents/stats')
        .expect(HTTP_STATUS.OK);

      expect(response.body.data.total).toBe(3);
      expect(response.body.data.byClassification).toBeDefined();
      expect(response.body.data.byClassification.public).toBe(1);
      expect(response.body.data.byClassification.internal).toBe(1);
      expect(response.body.data.byClassification.secret).toBe(1);
      expect(response.body.data.byClassification.confidential).toBe(0);
    });

    it('should filter stats by owner_id', async () => {
      const response = await request(app)
        .get('/api/documents/stats?owner_id=public-user')
        .expect(HTTP_STATUS.OK);

      expect(response.body.data.total).toBe(1);
      expect(response.body.data.byClassification.public).toBe(1);
      expect(response.body.data.byClassification.internal).toBe(0);
    });
  });
});
