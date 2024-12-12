const dbOperations = require('./dbOperations');
const redisOperations = require('./redisOperations');
const tokenService = require('./tokenService');

const registerUser = async (username, email, password) => {
    const client = await dbOperations.pool.connect();
    try {
      await client.query('BEGIN');
  /*
      const cachedUser = await redisOperations.checkUserExistsInCache(email);
      if (cachedUser) {
        throw new Error('User already exists in cache');
      }
  */
      const { success, message, userId } = await dbOperations.registerUser(client, username, email, password);
      if (!success) {
        throw new Error(message);
      }
  
      const { accessToken, refreshToken } = tokenService.generateTokens(userId);
      
      await dbOperations.saveRefreshToken(userId, refreshToken, client);
  
      await client.query('COMMIT');
      
      await redisOperations.cacheUser(email, userId);
  
      return { userId, accessToken};
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('User registration error:', error);
      throw error;
    } finally {
      client.release();
    }
  };

module.exports = { registerUser };