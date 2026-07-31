import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getSystemOverview = async (req, res) => {
    try {
        const [
            totalUsers,
            usersByRole,
            requestCount,
            totalResources
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.groupBy({
                by: ['role'],
                _count: { id: true }
            }),
            prisma.emergencyRequest.groupBy({
                by: ['status'],
                _count: { id: true }
            }),
            prisma.resource.count()
        ]);

        const roleBreakdown = usersByRole.reduce((acc, curr) => {
            acc[curr.role] = curr._count.id;
            return acc;
        }, { hospital: 0, supplier: 0, admin: 0 });

        const requestBreakdown = requestCount.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, { pending: 0, allocated: 0, delivered: 0, cancelled: 0 });

        const totalRequests = Object.values(requestBreakdown).reduce((a, b) => a + b, 0);
        const resolvedRequests = requestBreakdown.allocated + requestBreakdown.delivered;
        const fulfillmentRate = totalRequests > 0?
                                Math.round((resolvedRequests / totalRequests) * 100):
                                0;

        return res.status(200).json({
            users: {
                total: totalUsers,
                breakDown: roleBreakdown
            },
            resourcesCatalogTotal: totalResources,
            emergencyRequest: {
                total: totalRequests,
                fulfillmentRatePercentage: fulfillmentRate,
                breakDown: requestBreakdown
            }
        });
    }
    catch(error) {
        console.error("Get System Overview Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getResourceAnalytics = async (req, res) => {
    try {
        const [resourceStock, topRequestedResources] = await Promise.all([
            prisma.inventory.groupBy({
                by: ['resourceId'],
                _sum: {
                    quantityAvailable: true
                }
            }),
            prisma.emergencyRequest.groupBy({
                by:['resourceId'],
                _sum: {
                    quantityNeeded: true
                },
                _count: {
                    id: true
                },
                orderBy: {
                    _sum: {
                        quantityNeeded: 'desc'
                    }
                }
            })
        ]);

        const catalog = await prisma.resource.findMany();

        const analysis = catalog.map(item => {
            const stockEntry = resourceStock.find(s => s.resourceId === item.id);
            const demandEntry = topRequestedResources.find(d => d.resourceId === item.id);

            return {
                resourceId: item.id,
                name: item.name,
                category: item.category,
                totalAvailableStock: stockEntry?._sum?.quantityAvailable || 0,
                totalDemandQuantity: demandEntry?._sum?.quantityNeeded || 0,
                totalRequestTickets: demandEntry?._count?.id || 0
            }
        });

        return res.status(200).json({
            resourcesCount: analysis.length,
            analysis
        });
    }
    catch(error) {
        console.error("Get Resource Analytics Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}