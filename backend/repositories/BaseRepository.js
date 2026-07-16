/**
 * Ravora Backend V1 — Base Repository
 * Generic CRUD operations against Supabase PostgreSQL via the service role client.
 * All domain repositories extend this class.
 */

import { getSupabaseAdmin } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export class BaseRepository {
  /**
   * @param {string} tableName - The Supabase table name
   */
  constructor(tableName) {
    this.tableName = tableName;
  }

  /** @returns Supabase admin client */
  get db() {
    return getSupabaseAdmin();
  }

  /**
   * Find a single record by ID.
   * @param {string} id
   * @param {string} [select='*'] - Columns to select
   * @returns {Promise<object|null>}
   */
  async findById(id, select = '*') {
    const { data, error } = await this.db
      .from(this.tableName)
      .select(select)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error(this.tableName, `findById error`, { id, error: error.message });
      throw ApiError.internal(`Failed to fetch ${this.tableName}`);
    }

    return data;
  }

  /**
   * Find a single record matching filters.
   * @param {object} filters - Key-value pairs for .eq() filters
   * @param {string} [select='*']
   * @returns {Promise<object|null>}
   */
  async findOne(filters, select = '*') {
    let query = this.db.from(this.tableName).select(select);

    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      logger.error(this.tableName, `findOne error`, { filters, error: error.message });
      throw ApiError.internal(`Failed to fetch ${this.tableName}`);
    }

    return data;
  }

  /**
   * Find all records matching filters with pagination and sorting.
   * @param {object} options
   * @param {object} [options.filters] - Key-value pairs for .eq() filters
   * @param {number} [options.offset=0]
   * @param {number} [options.limit=25]
   * @param {string} [options.sortBy='created_at']
   * @param {string} [options.sortOrder='desc'] - 'asc' | 'desc'
   * @param {string} [options.select='*']
   * @returns {Promise<{ data: Array, count: number }>}
   */
  async findAll({ filters = {}, offset = 0, limit = 25, sortBy = 'created_at', sortOrder = 'desc', select = '*' } = {}) {
    let query = this.db
      .from(this.tableName)
      .select(select, { count: 'exact' });

    // Apply equality filters
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    }

    // Exclude soft-deleted records by default
    query = query.is('deleted_at', null);

    // Sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      // If deleted_at column doesn't exist, retry without the soft-delete filter
      if (error.message.includes('deleted_at')) {
        return this._findAllWithoutSoftDelete({ filters, offset, limit, sortBy, sortOrder, select });
      }
      logger.error(this.tableName, `findAll error`, { error: error.message });
      throw ApiError.internal(`Failed to fetch ${this.tableName} list`);
    }

    return { data: data || [], count: count || 0 };
  }

  /** Fallback findAll without soft-delete filter */
  async _findAllWithoutSoftDelete({ filters, offset, limit, sortBy, sortOrder, select }) {
    let query = this.db.from(this.tableName).select(select, { count: 'exact' });
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) query = query.eq(key, value);
    }
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) throw ApiError.internal(`Failed to fetch ${this.tableName} list`);
    return { data: data || [], count: count || 0 };
  }

  /**
   * Create a new record.
   * @param {object} data - Row data to insert
   * @returns {Promise<object>} The created record
   */
  async create(data) {
    const { data: created, error } = await this.db
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) {
      logger.error(this.tableName, `create error`, { error: error.message });
      if (error.code === '23505') {
        throw ApiError.conflict(`${this.tableName} already exists`);
      }
      throw ApiError.internal(`Failed to create ${this.tableName}`);
    }

    return created;
  }

  /**
   * Update a record by ID.
   * @param {string} id
   * @param {object} updates
   * @returns {Promise<object>} The updated record
   */
  async update(id, updates) {
    const { data, error } = await this.db
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error(this.tableName, `update error`, { id, error: error.message });
      throw ApiError.internal(`Failed to update ${this.tableName}`);
    }

    if (!data) {
      throw ApiError.notFound(this.tableName);
    }

    return data;
  }

  /**
   * Soft-delete a record by setting deleted_at.
   * @param {string} id
   */
  async softDelete(id) {
    return this.update(id, { deleted_at: new Date().toISOString() });
  }

  /**
   * Hard-delete a record.
   * @param {string} id
   */
  async hardDelete(id) {
    const { error } = await this.db
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      logger.error(this.tableName, `hardDelete error`, { id, error: error.message });
      throw ApiError.internal(`Failed to delete ${this.tableName}`);
    }
  }

  /**
   * Upsert a record (insert or update on conflict).
   * @param {object} data
   * @param {string} [onConflict] - Conflict column(s)
   * @returns {Promise<object>}
   */
  async upsert(data, onConflict = 'id') {
    const { data: result, error } = await this.db
      .from(this.tableName)
      .upsert(data, { onConflict })
      .select()
      .single();

    if (error) {
      logger.error(this.tableName, `upsert error`, { error: error.message });
      throw ApiError.internal(`Failed to upsert ${this.tableName}`);
    }

    return result;
  }
}
