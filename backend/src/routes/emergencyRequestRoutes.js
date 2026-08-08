import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { createEmergencyRequest, getEmergencyRequests, updateRequestStatus} from '../controller/emergencyRequestController.js';
import { emergencyLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('hospital'), emergencyLimiter, createEmergencyRequest);
router.get('/', authenticateToken, getEmergencyRequests);
router.patch('/:id/status', authenticateToken, authorizeRoles('hospital', 'supplier', 'admin'), updateRequestStatus);

export default router;