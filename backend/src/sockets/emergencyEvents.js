import { getIO } from "./socketServer.js";
import { notifyNearbyUsers, notifyRoom } from "./socketHelpers.js";

export const emitEmergencyCreatedNearby = (emergencyRequest, maxRadiusKm = 50) => {
    const io = getIO();
    notifyNearbyUsers(io, {
        originLat: emergencyRequest.hospital?.locationLat,
        originLng: emergencyRequest.hospital?.locationLng,
        maxRadiusKm,
        event: 'request:created',
        payload: {
            message: `Emergency Request within ${maxRadiusKm}km!`,
            request: emergencyRequest
        },
        targetRoles: ['supplier']
    });
};

export const emitRequestAllocated = (emergencyRequest, maxRadiusKm = 50) => {
    const io = getIO();

    notifyRoom(io, `user:${emergencyRequest.hospitalId}`, 'request:allocated', {
        message: `Your emergency request for ${emergencyRequest.resource.name} has been ALLOCATED!`,
        request: emergencyRequest
    });

    notifyNearbyUsers(io, {
        originLat: emergencyRequest.hospital?.locationLat,
        originLng: emergencyRequest.hospital?.locationLng,
        maxRadiusKm,
        event: 'request:claimed',
        payload: {
            message: `Emergency Request #${emergencyRequest.id} has been claimed.`,
            request: emergencyRequest.id,
            status: 'allocated'
        },
        targetRoles: ['supplier']
    });
};

export const emitRequestCancelled = (emergencyRequest, maxRadiusKm = 50) => {
    const io = getIO();

    notifyNearbyUsers(io, {
        originLat: emergencyRequest.hospital?.locationLat,
        originLng: emergencyRequest.hospital?.locationLng,
        maxRadiusKm,
        event: 'request:cancelled',
        payload: {
            message: `Emergency Request #${emergencyRequest.id} was cancelled.`,
            requestId: emergencyRequest.id,
            status: 'cancelled'
        },
        targetRoles: ['supplier']
    });
};

export const emitRequestDelivered = (emergencyRequest) => {
    const io = getIO();

    notifyRoom(
        io,
        [`user:${emergencyRequest.hospitalId}`, 'role:admin'],
        'request:delivered',
        {
            message: `Emergency Request #${emergencyRequest.id} has been delivered successfully!`,
           request: emergencyRequest 
        }
    );
};