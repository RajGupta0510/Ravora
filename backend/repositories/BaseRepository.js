/**
 * Ravora Backend V1 — Base Repository
 * Generic CRUD operations against Supabase PostgreSQL via the service role client.
 * All domain repositories extend this class.
 * Self-healing: Falls back to an in-memory database store if a table does not exist in the Supabase schema cache.
 */

import { getSupabaseAdmin } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

// Global in-memory fallback stores for unmigrated database tables
const memoryStores = new Map();

export function getMemoryStore(tableName) {
  if (!memoryStores.has(tableName)) {
    memoryStores.set(tableName, new Map());
  }
  return memoryStores.get(tableName);
}

export function withTimeout(promise, timeoutMs = 2000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timed out')), timeoutMs)
    )
  ]);
}

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
   * Checks if a database error is due to a missing table in the remote database.
   */
  isMissingTableError(error) {
    if (!error || !error.message) return false;
    const msg = error.message.toLowerCase();
    return msg.includes('schema cache') || msg.includes('does not exist') || msg.includes('relation');
  }

  /**
   * Find a single record by ID.
   */
  async findById(id, select = '*') {
    try {
      const { data, error } = await withTimeout(this.db
        .from(this.tableName)
        .select(select)
        .eq('id', id)
        .maybeSingle());

      if (error) {
        if (this.isMissingTableError(error)) {
          logger.warn(this.tableName, `Table missing in Supabase. Falling back to memory store for findById.`, { id });
          return getMemoryStore(this.tableName).get(id) || null;
        }
        logger.error(this.tableName, `findById error`, { id, error: error.message });
        throw ApiError.internal(`Failed to fetch ${this.tableName}`);
      }

      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      // Catch any unexpected connection/client issues
      logger.warn(this.tableName, `Supabase connection issue. Falling back to memory store.`, { id });
      return getMemoryStore(this.tableName).get(id) || null;
    }
  }

  /**
   * Find a single record matching filters.
   */
  async findOne(filters, select = '*') {
    try {
      let query = this.db.from(this.tableName).select(select);

      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }

      const { data, error } = await withTimeout(query.maybeSingle());

      if (error) {
        if (this.isMissingTableError(error)) {
          logger.warn(this.tableName, `Table missing. Falling back to memory store for findOne.`);
          return this._memoryFindOne(filters);
        }
        logger.error(this.tableName, `findOne error`, { filters, error: error.message });
        throw ApiError.internal(`Failed to fetch ${this.tableName}`);
      }

      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      return this._memoryFindOne(filters);
    }
  }

  _memoryFindOne(filters) {
    const store = getMemoryStore(this.tableName);
    for (const record of store.values()) {
      const match = Object.entries(filters).every(([k, v]) => record[k] === v);
      if (match) return record;
    }
    return null;
  }

  /**
   * Find all records matching filters with pagination and sorting.
   */
  async findAll({ filters = {}, offset = 0, limit = 25, sortBy = 'created_at', sortOrder = 'desc', select = '*' } = {}) {
    try {
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

      const { data, error, count } = await withTimeout(query);

      if (error) {
        if (this.isMissingTableError(error)) {
          logger.warn(this.tableName, `Table missing. Falling back to memory store for findAll.`);
          return this._memoryFindAll({ filters, offset, limit, sortBy, sortOrder });
        }
        // If deleted_at column doesn't exist, retry without the soft-delete filter
        if (error.message.includes('deleted_at')) {
          return this._findAllWithoutSoftDelete({ filters, offset, limit, sortBy, sortOrder, select });
        }
        logger.error(this.tableName, `findAll error`, { error: error.message });
        throw ApiError.internal(`Failed to fetch ${this.tableName} list`);
      }

      return { data: data || [], count: count || 0 };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      return this._memoryFindAll({ filters, offset, limit, sortBy, sortOrder });
    }
  }

  /** Fallback findAll without soft-delete filter */
  async _findAllWithoutSoftDelete({ filters, offset, limit, sortBy, sortOrder, select }) {
    try {
      let query = this.db.from(this.tableName).select(select, { count: 'exact' });
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) query = query.eq(key, value);
      }
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      query = query.range(offset, offset + limit - 1);
      const { data, error, count } = await withTimeout(query);
      if (error) {
        if (this.isMissingTableError(error)) {
          return this._memoryFindAll({ filters, offset, limit, sortBy, sortOrder });
        }
        throw ApiError.internal(`Failed to fetch ${this.tableName} list`);
      }
      return { data: data || [], count: count || 0 };
    } catch (err) {
      return this._memoryFindAll({ filters, offset, limit, sortBy, sortOrder });
    }
  }

  _memoryFindAll({ filters, offset, limit, sortBy, sortOrder }) {
    const store = getMemoryStore(this.tableName);
    let results = Array.from(store.values());

    // Filter
    results = results.filter(record => {
      if (record.deleted_at !== undefined && record.deleted_at !== null) return false;
      return Object.entries(filters).every(([k, v]) => {
        if (v === undefined || v === null) return true;
        return record[k] === v;
      });
    });

    // Sort
    results.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      
      const comp = valA < valB ? -1 : 1;
      return sortOrder === 'asc' ? comp : -comp;
    });

    // Paginate
    const paginated = results.slice(offset, offset + limit);
    return { data: paginated, count: results.length };
  }

  /**
   * Create a new record.
   */
  async create(data) {
    try {
      const { data: created, error } = await withTimeout(this.db
        .from(this.tableName)
        .insert(data)
        .select()
        .single());

      if (error) {
        if (this.isMissingTableError(error)) {
          logger.warn(this.tableName, `Table missing. Falling back to memory store for create.`);
          return this._memoryCreate(data);
        }
        logger.error(this.tableName, `create error`, { error: error.message });
        if (error.code === '23505') {
          throw ApiError.conflict(`${this.tableName} already exists`);
        }
        throw ApiError.internal(`Failed to create ${this.tableName}`);
      }

      return created;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      return this._memoryCreate(data);
    }
  }

  _memoryCreate(data) {
    const store = getMemoryStore(this.tableName);
    const id = data.id || Math.random().toString(36).substr(2, 9);
    const newRecord = {
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data
    };
    store.set(id, newRecord);
    return newRecord;
  }

  /**
   * Update a record by ID.
   */
  async update(id, updates) {
    try {
      const { data, error } = await withTimeout(this.db
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single());

      if (error) {
        if (this.isMissingTableError(error)) {
          logger.warn(this.tableName, `Table missing. Falling back to memory store for update.`);
          return this._memoryUpdate(id, updates);
        }
        logger.error(this.tableName, `update error`, { id, error: error.message });
        throw ApiError.internal(`Failed to update ${this.tableName}`);
      }

      if (!data) {
        throw ApiError.notFound(this.tableName);
      }

      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      return this._memoryUpdate(id, updates);
    }
  }

  _memoryUpdate(id, updates) {
    const store = getMemoryStore(this.tableName);
    const record = store.get(id);
    if (!record) {
      throw ApiError.notFound(this.tableName);
    }
    const updated = {
      ...record,
      ...updates,
      updated_at: new Date().toISOString()
    };
    store.set(id, updated);
    return updated;
  }

  /**
   * Soft-delete a record by setting deleted_at.
   */
  async softDelete(id) {
    return this.update(id, { deleted_at: new Date().toISOString() });
  }

  /**
   * Hard-delete a record.
   */
  async hardDelete(id) {
    try {
      const { error } = await withTimeout(this.db
        .from(this.tableName)
        .delete()
        .eq('id', id));

      if (error) {
        if (this.isMissingTableError(error)) {
          logger.warn(this.tableName, `Table missing. Falling back to memory store for hardDelete.`);
          getMemoryStore(this.tableName).delete(id);
          return;
        }
        logger.error(this.tableName, `hardDelete error`, { id, error: error.message });
        throw ApiError.internal(`Failed to delete ${this.tableName}`);
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      getMemoryStore(this.tableName).delete(id);
    }
  }

  /**
   * Upsert a record (insert or update on conflict).
   */
  async upsert(data, onConflict = 'id') {
    try {
      const { data: result, error } = await withTimeout(this.db
        .from(this.tableName)
        .upsert(data, { onConflict })
        .select()
        .single());

      if (error) {
        if (this.isMissingTableError(error)) {
          logger.warn(this.tableName, `Table missing. Falling back to memory store for upsert.`);
          return this._memoryUpsert(data);
        }
        logger.error(this.tableName, `upsert error`, { error: error.message });
        throw ApiError.internal(`Failed to upsert ${this.tableName}`);
      }

      return result;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      return this._memoryUpsert(data);
    }
  }

  _memoryUpsert(data) {
    const store = getMemoryStore(this.tableName);
    const id = data.id || Math.random().toString(36).substr(2, 9);
    
    const existing = store.get(id);
    if (existing) {
      return this._memoryUpdate(id, data);
    } else {
      return this._memoryCreate(data);
    }
  }
}
