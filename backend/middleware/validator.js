/**
 * Ravora Backend V1 — Request Validation Middleware
 * Lightweight field validation without external dependencies.
 */

import { ApiError } from '../utils/ApiError.js';

/**
 * Creates a validation middleware for request body fields.
 * @param {Array<{ field: string, type?: string, required?: boolean, min?: number, max?: number, enum?: string[] }>} rules
 */
export function validateBody(rules) {
  return (req, _res, next) => {
    const errors = [];
    const body = req.body || {};

    for (const rule of rules) {
      const value = body[rule.field];

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({ field: rule.field, message: `${rule.field} is required` });
        continue;
      }

      // Skip further checks if field is optional and missing
      if (value === undefined || value === null) continue;

      // Type check
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push({ field: rule.field, message: `${rule.field} must be a string` });
      } else if (rule.type === 'number' && typeof value !== 'number') {
        errors.push({ field: rule.field, message: `${rule.field} must be a number` });
      } else if (rule.type === 'boolean' && typeof value !== 'boolean') {
        errors.push({ field: rule.field, message: `${rule.field} must be a boolean` });
      } else if (rule.type === 'array' && !Array.isArray(value)) {
        errors.push({ field: rule.field, message: `${rule.field} must be an array` });
      }

      // Min/Max for numbers
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.min}` });
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push({ field: rule.field, message: `${rule.field} must be at most ${rule.max}` });
        }
      }

      // Min/Max length for strings
      if (typeof value === 'string') {
        if (rule.min !== undefined && value.length < rule.min) {
          errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.min} characters` });
        }
        if (rule.max !== undefined && value.length > rule.max) {
          errors.push({ field: rule.field, message: `${rule.field} must be at most ${rule.max} characters` });
        }
      }

      // Enum check
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({ field: rule.field, message: `${rule.field} must be one of: ${rule.enum.join(', ')}` });
      }
    }

    if (errors.length > 0) {
      return next(ApiError.badRequest('Validation failed', errors));
    }

    next();
  };
}

/**
 * Validates that req.params contains a valid UUID.
 */
export function validateUUID(paramName = 'id') {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return (req, _res, next) => {
    const value = req.params[paramName];
    if (!value || !uuidRegex.test(value)) {
      return next(ApiError.badRequest(`Invalid ${paramName} format. Expected UUID.`));
    }
    next();
  };
}
