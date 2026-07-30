import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createEmergencyRequest = async (req, res) => {
    try {
        const { resourceId, quantityNeeded} = req.body;

        if(!resourceId || !quantityNeeded || quantityNeeded < 0) {
            res.status(400).json({ error: "ResourceId and a positive quantityNeeded are required."})
        }

        const resourceExists = await prisma.resource.findUnique({
            where: {id: Number(resourceId)}
        });

        if(!resourceExists) {
            return res.status(400).json({error: "Resource ID not found in catalog."});
        }

        const newRequest = await prisma.emergencyRequest.create({
            data: {
                hospitalId: req.user.userId,
                resourceId: Number(resourceId),
                quantityNeeded: Number(quantityNeeded),
                status: 'pending'
            },
            include: {
                resource: true,
                hospital: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        locationLat: true,
                        locationLng: true
                    }
                }
            }
        });

        return res.status(201).json({
            message: "Emergency request created successfully",
            request: newRequest
        });
    }
    catch(error) {
        console.error("Create Emergency Request Error:", error);
        return res.status(500).json({error: "Internal server error"});
    }
}

export const getEmergencyRequests = async (req, res) => {
    try {
        const { status } = req.body;

        const requests = await prisma.emergencyRequest.findMany({
            where: {
                ...(status && { status }) 
            },
            include: {
                resource: true,
                hospital: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        locationLat: true,
                        locationLng: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({ requests });
    }
    catch(error) {
        console.log("Get Emergency Requests Error:", error);
        return res.status(500).json({ error: "Internal server error"});
    }
}

export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, inventoryId } = req.body;
        
        const validStatuses = ['pending', 'allocated', 'delivered', 'cancelled'];
        if(!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`});
        }

        const existingRequest = await prisma.emergencyRequest.findUnique({
            where: {id: Number(id)}
        });

        if(!existingRequest) {
            return res.status(400).json({error: "Emergency request not found."});
        }

        if(status === 'cancelled' && existingRequest.hospitalId !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Forbidden. Only the requesting hospital can cancel this request."});
        }

        if(status === 'allocated') {
            if(!inventoryId) {
                return res.status(400).json({ error: "InventoryId is required to allocate stock from an inventory"});
            }

            const result = await prisma.$transaction(async (tx) => {
                const inventory = await tx.inventory.findUnique({
                    where: {id: Number(inventoryId)}
                });

                if(!inventory) {
                    throw new Error("Target inventory record not found.");
                }

                if(inventory.quantityAvailable < existingRequest.quantityNeeded) {
                    throw new Error(`Insufficient stock. Needed: ${existingRequest.quantityNeeded}, Available: ${inventory.quantityAvailable}`);
                }

                const updatedInventory = await tx.inventory.update({
                    where: {id: Number(inventoryId)},
                    data: {quantityAvailable: inventory.quantityAvailable - existingRequest.quantityNeeded}
                });

                const updateRequest = await tx.emergencyRequest.update({
                    where: {id: Number(id)},
                    data: {status: 'allocated'},
                    include: {resource: true, hospital: true}
                });

                return {updateRequest, remainingStock: updatedInventory.quantityAvailable} 
            });

            return res.status(200).json({
                message: "Request successfully allocated and inventory stock updated.",
                request: result.updatedRequest,
                remainingStock: result.remainingStock
            });
        }

        const updatedRequest = await prisma.emergencyRequest.update({
            where: { id: Number(id) },
            data: { status },
            include: {
                resource: true,
                hospital: {
                    select: { id: true, name: true, email: true}
                }
            }
        });

        return res.status(200).json({
            message: `Emergency request status updated to ${status}`,
            request: updatedRequest
        });
    }
    catch(error) {
        console.error("Update Request Status Error:", error);
        return res.status(500).json({ error: "Internal server error"});
    }
}