import { Server } from "socket.io";
import { socketAuthMiddleware } from "./socketAuth.js";
import { handleRoomSubscriptions } from "./socketRooms.js";

let io = null;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: "*",
        methods: ["GET", "POST"]
    });

    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        const { userId, role } = socket.user;
        console.log(`Authenticated Client Connected: User ${userId} (${role}) [Socket: ${socket.id}]`);

        handleRoomSubscriptions(socket);

        socket.on('disconnect', () => {
            console.log(`Client Disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if(!io) {
        throw new Error("Socket.io has not been initialized!"); 
    }

    return io;
}
