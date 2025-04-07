import winston from 'winston';

// Define Logger Configuration
const logger = winston.createLogger(
    {
        level: 'info',           
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }), // Enable stack traces
            winston.format.printf(({ timestamp, level, message, stack }) => {
                return `${timestamp} [${level.toUpperCase()}]: ${message} ${stack ? '\n' + stack : ''}`;
            })
        ),    
        transports: [
            new winston.transports.Console()
        ],
    }
)

export default logger;
