const redisClient = require('../redisClient');

const checkUserExistsInCache = async (email) => {
  try {
    const cachedUser = await redisClient.get(`user:${email}`);
    return cachedUser !== null;
  } catch (error) {
    console.error('Redis error:', error);
    return false;
  }
};

const cacheUser = async (email, userId) => {
  try {
    await redisClient.set(`user:${email}`, userId, 'EX', 3600); // Cache for 1 hour
  } catch (error) {
    console.error('Redis caching error:', error);
  }
};

const deleteSession = async (userId) => {
  try {
    await redisClient.del(`session:${userId}`);
  } catch (error) {
    console.error('Redis delete session error:', error);
  }
};

module.exports = { checkUserExistsInCache, cacheUser,deleteSession };