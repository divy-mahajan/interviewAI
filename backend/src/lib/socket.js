const { Server } = require('socket.io');

let io = null;

// Map to store userId -> Set of socket IDs (to support multiple tabs)
const userSocketMap = {};

const allowedOrigins = [
    "http://localhost:5173",
    "https://interview-ai-phi-rust.vercel.app",
    "https://interview-ai-divy17.vercel.app"
];

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;

        if (userId) {
            if (!userSocketMap[userId]) {
                userSocketMap[userId] = new Set();
            }
            userSocketMap[userId].add(socket.id);
            console.log(`[Socket] User connected: ${userId} (socketId: ${socket.id})`);
        }

        // Broadcast currently online user IDs to all clients
        io.emit('getOnlineUsers', getOnlineUserIds());

        socket.on('disconnect', () => {
            if (userId && userSocketMap[userId]) {
                userSocketMap[userId].delete(socket.id);
                if (userSocketMap[userId].size === 0) {
                    delete userSocketMap[userId];
                }
                console.log(`[Socket] User disconnected: ${userId} (socketId: ${socket.id})`);
            }
            io.emit('getOnlineUsers', getOnlineUserIds());
        });
    });

    return io;
}

function getOnlineUserIds() {
    return Object.keys(userSocketMap).filter(id => userSocketMap[id] && userSocketMap[id].size > 0);
}

function getReceiverSocketIds(userId) {
    if (!userId || !userSocketMap[userId]) return [];
    return Array.from(userSocketMap[userId]);
}

function emitToUser(userId, eventName, data) {
    const socketIds = getReceiverSocketIds(userId);
    if (io && socketIds.length > 0) {
        socketIds.forEach(socketId => {
            io.to(socketId).emit(eventName, data);
        });
    }
}

function getIo() {
    return io;
}

module.exports = {
    initSocket,
    getIo,
    getReceiverSocketIds,
    emitToUser,
    getOnlineUserIds
};
