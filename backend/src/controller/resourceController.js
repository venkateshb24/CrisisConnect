import { PrismaClient } from "@prisma/client";
import { getCache, setCache, invalidateCache } from "../utils/cacheUtils.js";

const prisma = new PrismaClient();
const RESOURCE_CACHE_KEY = 'catlog:resources:all';

export const createResource = async (req, res) => {
    try {
        const {name, category} = req.body;
        if(!name || !category) {
            return res.status(400).json({ error: "Resource name and category are required."});
        }

        const resource = await prisma.resource.create({
            data: {name, category}
        });

        await invalidateCache(RESOURCE_CACHE_KEY);

        return res.status(201).json({ message: "Resource created", resource});
    }
    catch(error) {
        if(error.code === 'P2002') {
            return res.status(409).json({ error: "Resource with this name already exists."});
        }

        console.log("Create Resource Error: ", error);
        return res.status(500).json({ error: "Internal server error"});
    }
}

export const getResources = async (req, res) => {
    try {
        const cachedResources = await getCache(RESOURCE_CACHE_KEY);
        if(cachedResources) {
            return res.status(200).json({
                source: 'cache',
                count: cachedResources.length,
                resources: cachedResources
            });
        }

        const resources = await prisma.resource.findMany();

        await setCache(RESOURCE_CACHE_KEY, resources, 3600);

        return res.status(200).json({
            source: 'database',
            count: resources.length,
            resources
        });
    }
    catch(error) {
        console.error("Get Resources Error:", error);
        return res.status(500).json({ error: "Internal server error"});
    }
}