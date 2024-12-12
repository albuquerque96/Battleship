require("dotenv").config();
const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 10000,
    reconnectStrategy: (retries) => {
      console.log(`Reconnecting to Redis... Attempt: ${retries}`);
      return Math.min(retries * 1000, 30000); // Espera entre 1 e 30 segundos entre tentativas
    }
  },
});

redisClient.on('error', (err) => {
  console.error('Redis client error', err);
});

redisClient.connect()
  .then(() => console.log('Connected to Redis'))
  .catch((err) => console.error('Failed to connect to Redis', err));

process.on('SIGINT', async () => {
  try {
    await redisClient.quit();
    console.log('Redis client disconnected gracefully');
  } catch (err) {
    console.error('Error disconnecting Redis client', err);
  } finally {
    process.exit(0);
  }
});

module.exports = redisClient;
