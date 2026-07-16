/**
 * Ravora Backend V1 — Consistent API Response Format
 */

export class ApiResponse {
  /**
   * Success response
   * @param {object} data - Response payload
   * @param {string} [message] - Optional success message
   * @param {object} [meta] - Pagination/metadata
   */
  static success(res, data = null, message = null, meta = null, statusCode = 200) {
    const body = { success: true };
    if (data !== null) body.data = data;
    if (message) body.message = message;
    if (meta) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  /**
   * Created response (201)
   */
  static created(res, data, message = 'Resource created successfully') {
    return ApiResponse.success(res, data, message, null, 201);
  }

  /**
   * Paginated list response
   * @param {Array} items - List of items
   * @param {number} total - Total count (unfiltered)
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   */
  static paginated(res, items, total, page, limit) {
    return ApiResponse.success(res, items, null, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  }

  /**
   * No content response (204)
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Error response (used by errorHandler middleware)
   */
  static error(res, statusCode, message, code = 'ERROR', details = null) {
    const body = {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    };
    return res.status(statusCode).json(body);
  }
}
