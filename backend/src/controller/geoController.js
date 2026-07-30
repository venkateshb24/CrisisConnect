import { PrismaClient } from "@prisma/client";
import { calculateDistanceKm  } from "../utils/geoUtils.js";

const prisma = new PrismaClient();

export const searchNearbyInventory = async (req, res) => {
    try {
        const { resourceId, maxRadiusKm = 50} = req.query;

        if(!resourceId) {
            return res.status(400).json({ error: "ResourceId query parameter is required."});
        }

        const currentUser = await prisma.user.findUnique({
            where: {id: req.user.userId},
            select: {locationLat: true, locationLng: true}
        });

        if(!currentUser || currentUser.locationLat === null || currentUser.locationLng === null) {
            return res.status(400).json({ error: "User location coordinates are missing."});
        }

        const userLat = Number(currentUser.locationLat);
        const userLng = Number(currentUser.locationLng);

        const inventories = await prisma.inventory.findMany({
            where: {
                resourceId: Number(resourceId),
                quantityAvailable: { gt: 0 }
            },
            include: {
                resource: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        locationLat: true,
                        locationLng: true
                    }
                }
            }
        });

        const nearbyResults = inventories
            .map((item) => {
                const ownerLat = Number(item.user.locationLat);
                const ownerLng = Number(item.user.locationLng);

                const distanceKm = calculateDistanceKm(userLat, userLng, ownerLat, ownerLng);

                return {
                    ...item,
                    distanceKm
                };
            })
            .filter((item) => item.distanceKm <= Number(maxRadiusKm))
            .sort((a, b) => a.distanceKm - b.distanceKm);

        return res.status(200).json({
            count: nearbyResults.length,
            userLocation: { lat: userLat, lng: userLng },
            searchRadiusKm: Number(maxRadiusKm),
            results: nearbyResults
        });
    }
    catch(error) {
        console.log("Search Nearby Inventory Error:", error);
        return res.status(500).json({ error: "Internal server error"});
    }
}