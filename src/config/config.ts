import dotenv from "dotenv";
import { createClient } from "redis";
import logger from "../utils/logger";

// Load environment variables once
dotenv.config();

// Export configuration
export const CONFIG = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY as string,
  REDIS: {
    HOST: process.env.REDIS_HOST || "127.0.0.1",
    PORT: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  },
};

// Redis client
export const redisClient = createClient({
  socket: {
    host: CONFIG.REDIS.HOST,
    port: CONFIG.REDIS.PORT,
    reconnectStrategy: (retries) => {
      logger.warn(`Redis reconnect attempt: ${retries}`);
      if (retries > 5) {
        logger.error("Max Redis reconnect attempts reached. Giving up.");
        return new Error("Max reconnect attempts reached");
      }
      return Math.min(retries * 200, 3000); // Exponential backoff
    },
  },
});

// Handle redis connection events
redisClient.on("error", (error: Error) => {
  logger.error(`Error connecting to Redis: ${error}`);
});
redisClient.on("end", () => {
  logger.warn("Disconnected from Redis");
});

// Handle redis connection
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info("Connected to Redis");
  } catch (error) {
    logger.error(`Error connecting to Redis: ${error}`);
  }
};
