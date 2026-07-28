import express from 'express';
import { createInventory, getInventories, updateInventory } from '../controller/inventoryController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('hospital', 'supplier'), createInventory);
router.get('/', authenticateToken, getInventories);
router.patch('/:id', authenticateToken, authorizeRoles('hospital', 'supplier', 'admin'), updateInventory);

export default router;