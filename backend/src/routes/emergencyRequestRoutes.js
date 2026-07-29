import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { createEmergencyRequest, getEmergencyRequests, updateRequestStatus} from '../controller/emergencyRequestController.js';

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('hospital'), createEmergencyRequest);
router.get('/', authenticateToken, getEmergencyRequests);
router.patch('/:id/status', authenticateToken, authorizeRoles('hospital', 'supplier', 'admin'), updateRequestStatus);

export default router;