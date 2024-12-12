const dbOperations = require("./dbOperations");
const redisOperations = require("./redisOperations");
const tokenService = require("./tokenService");
//const userService = require('./userService');
const { pool } = require('./dbOperations');


const register = async (username, email, password) => {
  try {
      const result = await userService.registerUser(username, email, password);
      if (!result.success) {
          // Lança um erro se o registro falhar (usuário já existe, etc.)
          const error = new Error(result.message);
          error.statusCode = result.message === 'User already exists' ? 409 : 400; // 409 Conflict para usuário existente
          throw error;
      }
      return { success: true, ...result };
  } catch (error) {
      console.error('Registration error:', error);
      throw error; // Passa o erro para o middleware de erro
  }
};


const login = async (email, password) => {
  const client = await pool.connect();
  try {
    const user = await dbOperations.getUserByEmail(client, email);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await tokenService.isPasswordMatch(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const { accessToken, refreshToken } = tokenService.generateTokens(user.player_id);
    await dbOperations.saveRefreshToken(user.player_id, refreshToken, client);

    return { userId: user.player_id, accessToken, refreshToken };
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

const logout = async (userId) => {
  const client = await pool.connect();
  try {
    const deletedCount = await dbOperations.deleteRefreshToken(client, userId);
    if (deletedCount === 0) {
      throw new Error('No active session found for this user');
    }
    //await redisOperations.deleteSession(userId);
  } finally {
    client.release();
  }
};

const refreshAccessToken = async (refreshToken) => {
  const { valid, decoded, error } = await tokenService.validateToken(refreshToken, true);
  if (!valid) {
    throw new Error(error || 'Invalid refresh token');
  }

  const client = await pool.connect();
  try {
    const storedToken = await dbOperations.getRefreshToken(client, decoded.userId, refreshToken);
    if (!storedToken) {
      throw new Error('Refresh token not found in database');
    }

    const newAccessToken = await tokenService.createToken(decoded.userId, decoded.email, decoded.roles, '15m');
    return { accessToken: newAccessToken };
  } finally {
    client.release();
  }
};

module.exports = { register, login, refreshAccessToken, logout };