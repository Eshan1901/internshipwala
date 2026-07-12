/**
 * Validation Middleware
 *
 * Runs a Zod schema against a chosen part of the Express request object.
 * On failure it forwards a structured 400 AppError to the global error handler.
 * On success it replaces the raw input with Zod's coerced, sanitised output so
 * downstream controllers always receive clean, typed values.
 *
 * From Backend-Architecture.md Section 7.3:
 *
 *   validate(schema, target) → Express middleware
 *
 *   target  'body'   (default) — req.body
 *           'params'           — req.params
 *           'query'            — req.query
 *
 * Usage:
 *   router.post('/register',
 *     validate(registerSchema),           // validates req.body
 *     validate(someParamSchema, 'params'), // validates req.params
 *     validate(someQuerySchema, 'query'),  // validates req.query
 *     asyncHandler(authController.register)
 *   );
 */

import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * Create an Express validation middleware for the given Zod schema.
 *
 * @param {import('zod').ZodTypeAny} schema - Zod schema to validate against
 * @param {'body'|'params'|'query'} [target='body'] - Which part of req to validate
 * @returns {import('express').RequestHandler}
 */
export const validate = (schema, target = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      // Map Zod issues to the standard { field, message } error shape
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || target,
        message: issue.message,
      }));

      return next(new AppError(400, MESSAGES.VALIDATION_FAILED, errors));
    }

    // Replace raw input with coerced, sanitised Zod output
    req[target] = result.data;
    return next();
  };
