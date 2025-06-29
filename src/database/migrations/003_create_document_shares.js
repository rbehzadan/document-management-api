const { TABLES, PERMISSION_LEVELS } = require('../../utils/constants');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable(TABLES.DOCUMENT_SHARES, function(table) {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Foreign key to documents table
    table.uuid('document_id')
      .notNullable()
      .references('id')
      .inTable(TABLES.DOCUMENTS)
      .onDelete('CASCADE');
    
    // Shared with user (will be foreign key later)
    table.string('shared_with_user_id').notNullable();
    
    // Permission level
    table.enu('permission_level', [
      PERMISSION_LEVELS.READ,
      PERMISSION_LEVELS.WRITE,
      PERMISSION_LEVELS.ADMIN
    ]).notNullable().defaultTo(PERMISSION_LEVELS.READ);
    
    // Metadata
    table.string('shared_by').notNullable(); // Who granted the permission
    table.timestamp('shared_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at').nullable(); // Optional expiration
    
    // Indexes
    table.index(['document_id']);
    table.index(['shared_with_user_id']);
    table.index(['document_id', 'shared_with_user_id']);
    table.index(['shared_by']);
    table.index(['expires_at']);
    
    // Ensure unique shares per document-user combination
    table.unique(['document_id', 'shared_with_user_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists(TABLES.DOCUMENT_SHARES);
};
