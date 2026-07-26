import express from "express";
import { registerUser, loginUser, refreshToken, logoutUser } from "../controller/authController.js";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);

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