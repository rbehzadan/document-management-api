const { TABLES, CLASSIFICATION_LEVELS } = require('../../utils/constants');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable(TABLES.DOCUMENTS, function(table) {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Document content
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    
    // Classification and ownership
    table.integer('classification')
      .notNullable()
      .defaultTo(CLASSIFICATION_LEVELS.INTERNAL)
      .checkIn([
        CLASSIFICATION_LEVELS.PUBLIC,
        CLASSIFICATION_LEVELS.INTERNAL,
        CLASSIFICATION_LEVELS.CONFIDENTIAL,
        CLASSIFICATION_LEVELS.SECRET
      ]);
    
    // For now, owner_id is just a string (will be UUID foreign key later)
    table.string('owner_id').notNullable();
    
    // Metadata
    table.timestamps(true, true); // created_at, updated_at with timezone
    table.timestamp('deleted_at').nullable(); // Soft delete support
    
    // Indexes
    table.index(['owner_id']);
    table.index(['classification']);
    table.index(['created_at']);
    table.index(['title']); // For search functionality
    
    // Composite index for common queries
    table.index(['owner_id', 'classification']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLES.DOCUMENTS);
};
