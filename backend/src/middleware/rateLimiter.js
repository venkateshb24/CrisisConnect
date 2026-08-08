import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis.js';

export const globalLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'rl:global:'
    }),
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        error: "Too many requests from this IP. Please try again after 15 minutes."
    }
});

export const authLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'rl:auth:'
    }),
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        error: "Too many authentication attempts. Please try again in 15 minutes."
    }
});

export const emergencyLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'rl:emergency:'
    }),
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        error: "Emergency request limit reached for this IP. Please wait before posting more requests."
    }
});