import { z } from 'zod';

export const exampleSchema = {
  ObjQuery: z.object({
    search: z.string().optional(),
    limit: z.number().int().positive().optional(),
  }),
  ObjParams: z.object({
    id: z.string().uuid(),
  }),
  ObjBody: z.object({
    name: z.string(),
    email: z.string().email(),
    age: z.number().int().positive().optional(),
  }),
};
