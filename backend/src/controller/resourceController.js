import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createResource = async (req, res) => {
    try {
        const {name, category} = req.body;
        if(!name || !category) {
            return res.status(400).json({ error: "Resource name and category are required."});
        }

        const resource = await prisma.resource.create({
            data: {name, category}
        });

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
        const resources = await prisma.resource.findMany();
        return res.status(200).json({ resources });
    }
    catch(error) {
        return res.status(500).json({ error: "Internal server error"});
    }
}