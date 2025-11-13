import { Router } from 'express';
import { createStudyPack } from '../controllers/studyController.js';

const router = Router();

router.post('/', createStudyPack);

export default router;

