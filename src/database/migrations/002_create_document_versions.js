const { TABLES } = require('../../utils/constants');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable(TABLES.DOCUMENT_VERSIONS, function(table) {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Foreign key to documents table
    table.uuid('document_id')
      .notNullable()
      .references('id')
      .inTable(TABLES.DOCUMENTS)
      .onDelete('CASCADE');
    
    // Version information
    table.integer('version').notNullable();
    table.text('content').notNullable();
    table.text('change_description').nullable();
    
    // Metadata
    table.string('created_by').notNullable(); // Will be UUID foreign key later
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['document_id']);
    table.index(['document_id', 'version']);
    table.index(['created_by']);
    table.index(['created_at']);
    
    // Ensure unique version numbers per document
    table.unique(['document_id', 'version']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLES.DOCUMENT_VERSIONS);
};
