import { Server } from "socket.io";
import { io }   from "../server"; 
import logger from "../utils/logger";

export const registerSocketHandlers = (io: Server) => {
  io.on('connection', (socket) => {
    logger.info('Client connected to socket: ', socket.id);

    socket.on('subscribeToJob', (jobId: string) => {
      socket.join(jobId);
      logger.info(`Client subscribed to Job: ${jobId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from socket:', socket.id);
    });
  });
};

// This function emits a progress update for a specific node to socket
export const emitNodeProgress = (
    jobId: string,
    nodeUpdate: {
        nodeId: string;
        type: string;
        status: string;
        progressPercentage: number;        
        response?: any;
        errorMessage?: any;       
    }
)  => {
    io.to(jobId).emit('workflow-progress', {
       jobId,
       ...nodeUpdate, 
});
};