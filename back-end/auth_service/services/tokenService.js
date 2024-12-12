require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const tokenService = {
  generateTokens: (userId) => {
    const accessToken = jwt.sign({ userId }, accessTokenSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, refreshTokenSecret, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  },

  validateToken: async (token, isRefreshToken = false) => {
    if (!token) {
      return { valid: false, message: 'No token provided' };
    }
    try {
      const secret = isRefreshToken ? refreshTokenSecret : accessTokenSecret;
      const decoded = jwt.verify(token, secret);
      return { valid: true, decoded };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  },

  createToken: async (id, email, roles, duration) => {
    return jwt.sign({ id, email, roles }, accessTokenSecret, { expiresIn: duration });
  },

  isPasswordMatch: async (inputPassword, hashedPassword) => {
    return bcrypt.compare(inputPassword, hashedPassword);
  }
};

module.exports = tokenService;