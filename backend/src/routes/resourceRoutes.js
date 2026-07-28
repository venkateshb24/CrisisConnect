import express from 'express';
import { createResource, getResources} from '../controller/resourceController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('Admin', 'supplier'), createResource);
router.get('/', authenticateToken, getResources);

export default router;