import { Socket } from "socket.io";
import { calculateDistanceKm } from "../utils/geoUtils.js";


export const notifySocket = (socket, event, payload) => {
    if(socket && typeof socket.emit === 'function') {
        socket.emit(event, payload);
    }
};

export const notifyRoom = (io, rooms, event, payload) => {
    if(!io) return;

    io.to(rooms).emit(event, payload);
};

export const notifyNearbyUsers = (io, { originLat, originLng, maxRadiusKm = 50, event, payload, targetRoles = []}) => {
    if(!io) return;

    const lat = Number(originLat);
    const lng = Number(originLng);

    if(!lat || !lng) {
        const rooms = targetRoles.map(role => `role:${role}`);
        notifyRoom(io, [...rooms, 'role:admin'], event, payload);
        return;
    }

    const connectedSockets = io.sockets.sockets;
    let notifiedCount = 0;

    connectedSockets.forEach((socket) => {
        const user = socket.user;
        if(!user) return;

        if(user.role === 'admin') {
            socket.emit(event, {...payload, distanceKm: 0});
            notifiedCount++;
            return;
        }

        if(targetRoles.length > 0 && !targetRoles.includes(user.role)) {
            return;
        }

        if(user.locationLat && user.locationLng) {
            const distanceKm = calculateDistanceKm(
                lat,
                lng,
                Number(user.locationLat),
                Number(user.locationLng)
            );

            if(distanceKm <= maxRadiusKm) {
                socket.emit(event, { ...payload, distanceKm});
                notifiedCount++;
            }
        }
    });

    console.log(`[Radial Broadcast] '${event}' sent to ${notifiedCount} users within ${maxRadiusKm}km.`)
}