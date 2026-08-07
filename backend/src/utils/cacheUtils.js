import redisClient from "../config/redis.js";


export const getCache = async (key) => {
    try {
        const data = await redisClient.get(key);
        return data? JSON.parse(data): null;
    }
    catch(err) {
        console.error(`Cache Read Error [${key}]:`, err.message);
        return null;
    }
};

export const setCache = async (key, value, ttlSeconds = 300) => {
    try {
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    }
    catch(err) {
        console.error(`Cache Set Error [${key}]:`, err.message);
    }
};

export const invalidateCache = async (pattern) => {
    try {
        const keys = await redisClient.keys(pattern);
        if(keys.length > 0) {
            await redisClient.del(keys);
            console.log(`Cache Invalidated for pattern: ${pattern} (${keys.length} keys)`);
        }
    }
    catch(err) {
        console.log(`Cache Invalidation Error [${pattern}]:`, err.message);
    }
};