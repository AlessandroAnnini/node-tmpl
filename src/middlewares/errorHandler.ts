import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import logger from '../config/logger';

// Explicitly type the errorHandler as an Express ErrorRequestHandler
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Log the error using Pino
  logger.error(err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation error',
      errors: err.errors,
    });
    return; // Exit after handling the error
  }

  // Extract status and message from the error, defaulting if necessary
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Send the error response
  res.status(status).json({ message });
  // No return statement needed
};
