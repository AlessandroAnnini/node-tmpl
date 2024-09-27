import type { Request, Response, NextFunction } from 'express';
import {
  fetchNoParams,
  fetchWithQuery,
  fetchWithParams,
  fetchWithBody,
} from '../services/exampleService';

/**
 * Handler for GET /v1/no-params
 */
export const getNoParams = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await fetchNoParams();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * Handler for GET /v1/query
 */
export const getWithQuery = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await fetchWithQuery(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * Handler for GET /v1/params/:id
 */
export const getWithParams = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const data = await fetchWithParams(id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * Handler for POST /v1/body
 */
export const postWithBody = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = req.body;
    const data = await fetchWithBody(payload);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
