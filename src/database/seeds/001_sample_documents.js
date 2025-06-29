const { TABLES, CLASSIFICATION_LEVELS } = require('../../utils/constants');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Clear existing entries
  await knex(TABLES.DOCUMENTS).del();

  // Insert sample documents
  await knex(TABLES.DOCUMENTS).insert([
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Company Handbook',
      content: 'This document contains the company policies and procedures that all employees must follow. It includes information about work hours, dress code, vacation policies, and code of conduct.',
      classification: CLASSIFICATION_LEVELS.INTERNAL,
      owner_id: 'user-1',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Public API Documentation',
      content: 'Complete documentation for our public REST API. This includes endpoint descriptions, request/response examples, authentication methods, and rate limiting information.',
      classification: CLASSIFICATION_LEVELS.PUBLIC,
      owner_id: 'user-2',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Financial Report Q4 2024',
      content: 'Confidential financial analysis for Q4 2024 including revenue breakdowns, expense reports, and profit margins. This document contains sensitive financial information.',
      classification: CLASSIFICATION_LEVELS.CONFIDENTIAL,
      owner_id: 'user-1',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      title: 'Security Incident Response Plan',
      content: 'Detailed procedures for handling security incidents including contact information for security team, escalation procedures, and recovery protocols.',
      classification: CLASSIFICATION_LEVELS.SECRET,
      owner_id: 'user-3',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      title: 'Meeting Notes - Team Standup',
      content: 'Daily standup meeting notes from the development team. Discussed current sprint progress, blockers, and upcoming deadlines.',
      classification: CLASSIFICATION_LEVELS.INTERNAL,
      owner_id: 'user-2',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      title: 'Open Source License Information',
      content: 'List of all open source libraries used in our projects along with their licenses and attribution requirements.',
      classification: CLASSIFICATION_LEVELS.PUBLIC,
      owner_id: 'user-1',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};
