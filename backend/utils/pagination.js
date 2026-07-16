/**
 * Ravora Backend V1 — Pagination Helper
 */

import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../config/constants.js';

/**
 * Parses and normalizes pagination parameters from query string.
 * @param {object} query - Express req.query
 * @returns {{ page: number, limit: number, offset: number, sortBy: string, sortOrder: string }}
 */
export function parsePagination(query) {
  let page = parseInt(query.page, 10) || DEFAULT_PAGE;
  let limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;

  if (page < 1) page = 1;
  if (limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const offset = (page - 1) * limit;
  const sortBy = query.sort_by || 'created_at';
  const sortOrder = query.sort_order === 'asc' ? 'asc' : 'desc';

  return { page, limit, offset, sortBy, sortOrder };
}
