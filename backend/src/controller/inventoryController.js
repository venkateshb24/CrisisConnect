import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createInventory = async (req, res) => {
    try {
        const { resourceId, quantityAvailable} = req.body;

        if(!resourceId || quantityAvailable == undefined || quantityAvailable < 0) {
            return res.status(400).json({ error: "resourceId and a valid quantityAvailable are required."});
        }

        const resourceExists = await prisma.resource.findUnique({
            where: { id: Number(resourceId)}
        });

        if(!resourceExists) {
            return res.status(404).json({ error: "Resource ID not found in resource catalog"});
        }

        const newInventory = await prisma.inventory.create({
            data: {
                userId: req.user.userId,
                resourceId: Number(resourceId),
                quantityAvailable: Number(quantityAvailable),
            },
            include: {
                resource: true
            }
        });

        return res.status(201).json({
            message: "Inventory entry created successfully",
            inventory: newInventory
        })
    }
    catch(error) {
        console.error("Create Inventory Error:", error);
        return res.status(500).json({ error: "Internal server error"});
    }
}

export const getInventories = async (req, res) => {
    try {
        const inventories = await prisma.inventory.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        locationLat: true,
                        locationLng: true
                    }
                },
                resource: true
            }
        });

        return res.status(200).json({ inventories});
    }
    catch(error) {
        console.error("Get Inventories Error:", error);
        return res.status(500).json({ error: "Internal server error"});
    }
}

export const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantityAvailable } = req.body;

        const existingItem = await prisma.inventory.findUnique({
            where: {id: Number(id)}
        });

        if(!existingItem) {
            return res.status(404).json({ error: "Inventory record not found."});
        }

        if(existingItem.userId !== req.user.userId && req.user.role !==  'admin') {
            return res.status(403).json({ error: "Forbidden. You do not have permission to modify another user's inventory."});
        }

        if (quantityAvailable !== undefined && quantityAvailable < 0) {
            return res.status(400).json({error: "Quantity cannot be negative."});
        }

        const updatedInventory = await prisma.inventory.update({
            where: {id: Number(id)},
            data: {
                ...(quantityAvailable !== undefined && {quantityAvailable: Number(quantityAvailable)}),
            },
            include: { resource: true }
        });

        return res.status(200).json({
            message: "Inventory item updated successfully",
            inventory: updatedInventory
        });
    }
    catch(error) {
        console.error("Update Inventory Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}