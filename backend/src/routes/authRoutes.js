import express from "express";
import { registerUser, loginUser, refreshToken, logoutUser } from "../controller/authController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/refresh', authLimiter, refreshToken);
router.post('/logout', authLimiter, logoutUser);

router.get('/me', authenticateToken, (req, res) => {
    return res.status(200).json({
        message: "Protected profile data retrieved successfully",
        user: req.user
    });
});

router.get('/hospital', authenticateToken, authorizeRoles('hospital'), (req, res) => {
    return res.status(200).json({ message: "Welcome to the hospital management"});
})

export default router;  