import express from 'express';
import {
  getNoParams,
  getWithQuery,
  getWithParams,
  postWithBody,
} from '../controllers/exampleController';
import { validationMiddleware } from '../../middlewares/validationMiddleware';
import { exampleSchema } from '../schemas/exampleSchema';

const router = express.Router();

// GET /v1/no-params
router.get('/no-params', getNoParams);

// GET /v1/query?search=term&limit=10
router.get(
  '/query',
  validationMiddleware(exampleSchema.ObjQuery),
  getWithQuery,
);

// GET /v1/params/:id
router.get(
  '/params/:id',
  validationMiddleware(exampleSchema.ObjParams),
  getWithParams,
);

// POST /v1/body
router.post('/body', validationMiddleware(exampleSchema.ObjBody), postWithBody);

export default router;
