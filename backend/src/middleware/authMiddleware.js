import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({ error: "Access Denied. No token provided."});
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        )

        req.user = decoded;

        next();
    }
    catch(error) {
        return res.status(403).json({ error: "Invalid or expired access token."});
    }
}

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: `Forbidden. Role '${req.user?.role}' does not have access to this resource.`})
        }

        next();
    }
}