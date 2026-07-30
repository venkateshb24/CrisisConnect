import express from "express";
import { searchNearbyInventory } from "../controller/geoController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/nearby-inventory', authenticateToken, searchNearbyInventory);

export default router;