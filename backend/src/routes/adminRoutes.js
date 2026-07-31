import express from 'express';
import { getSystemOverview, getResourceAnalytics } from '../controller/adminController.js';
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/overview', authenticateToken, authorizeRoles('admin'), getSystemOverview);
router.get('/resource-analytics', authenticateToken, authorizeRoles('admin'), getResourceAnalytics);

export default router;