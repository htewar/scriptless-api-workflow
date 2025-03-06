import app from './app';
import { Server } from 'socket.io';
import http from 'http';

const PORT = 3000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" } // added cross origin for flask sonce we are using same ip
});

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { io };
