import { Server } from 'socket.io';

let io = null;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`Real-Time Client Connected: ${socket.id}`);

        socket.on('joinRoom', (roomName) => {
            socket.join(roomName);
            console.log(`Socket ${socket.id} joined room: ${roomName}`);
        });

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

export const emitEmergencyAlert = (emergencyRequest) => {
    if(io) {
        io.emit('emergency:created', {
            message: 'New Emergency Request Created!',
            request: emergencyRequest
        });
    }
};