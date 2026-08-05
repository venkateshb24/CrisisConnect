export const handleRoomSubscriptions = (socket) => {
    const { userId, role } = socket.user;

    socket.join(`role:${role}`);

    socket.join(`user:${userId}`);

    console.log(`Socket ${socket.id} joined rooms: [role:${role}], [user:${userId}]`);
}