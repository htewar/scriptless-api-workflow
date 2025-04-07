import app from './app';
import { Server} from 'socket.io';
import http from 'http';
import { registerSocketHandlers } from './sockets/socket-handler';

const PORT =  3000;

const server = http.createServer(app);

// Initialize Socket.io
export const io = new Server(server, {
  cors: {
    origin: '*', // temporary, this should replace with frontend URL
  },
});

// Register socket handlers
registerSocketHandlers(io);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});