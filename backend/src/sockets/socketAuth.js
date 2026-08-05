import jwt from 'jsonwebtoken';

export const socketAuthMiddleware = (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;

        if(!token) {
            return next(new Error("Authentication error: Token missing."));
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        socket.user = decoded;
        return next();
    }
    catch(err) {
        console.error("Socket Auth Error:", err.message);
        return next(new Error("Authentication error: Invalid or expired token."));
    }
}