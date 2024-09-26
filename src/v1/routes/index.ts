import { Router } from 'express';
import exampleRoutes from './exampleRoutes';

const router = Router();

router.use('/example', exampleRoutes);

export default router;
