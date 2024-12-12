const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const checkUserExists = async (client, email) => {
  try {
    const result = await client.query('SELECT player_id FROM users WHERE email = $1', [email]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    throw new Error('Database query error');
  }
};

const registerUser = async (client, username, email, password) => {
  try {
    const userExists = await checkUserExists(client, email);
    if (userExists) {
      return { success: false, message: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING player_id',
      [username, email, hashedPassword]
    );

    return { success: true, message: 'User registered successfully', userId: result.rows[0].player_id };
  } catch (error) {
    console.error('Error registering user:', error);
    throw new Error('Database registration error');
  }
};

const getUserByEmail = async (client, email) => {
  try {
    const result = await client.query('SELECT player_id, password FROM users WHERE email = $1', [email]);
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw new Error('Database query error');
  }
};

const deleteRefreshToken = async (client, userId) => {
  try {
    const result = await client.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    return result.rowCount;
  } catch (error) {
    console.error('Error deleting refresh token:', error);
    throw new Error('Database deletion error');
  }
};

const deleteAccessToken = async (client, userId) => {
  try {
    const result = await client.query('DELETE FROM access_tokens WHERE user_id = $1', [userId]);
    return result.rowCount;
  } catch (error) {
    console.error('Error deleting access token:', error);
    throw new Error('Database deletion error');
  }
};

const saveRefreshToken = async (userId, refreshToken, client) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  try {
    await client.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = $3',
      [userId, refreshToken, expiresAt]
    );
  } catch (error) {
    console.error('Error saving refresh token:', error);
    throw new Error('Database save error');
  }
};

const getRefreshToken = async (userId, client) => {
  try {
    const result = await client.query(
      'SELECT token, expires_at FROM refresh_tokens WHERE user_id = $1',
      [userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error getting refresh token:', error);
    throw new Error('Database query error');
  }
};

const saveAccessToken = async (userId, accessToken, client) => {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
  try {
    await client.query(
      'INSERT INTO access_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = $3',
      [userId, accessToken, expiresAt]
    );
  } catch (error) {
    console.error('Error saving access token:', error);
    throw new Error('Database save error');
  }
};

/*
const getAccessToken = async (userId, client) => {
  try {
    const result = await client.query(
      'SELECT token, expires_at FROM access_tokens WHERE user_id = $1',
      [userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}; */

module.exports = {
  checkUserExists,
  registerUser,
  getUserByEmail,
  saveRefreshToken,
  saveAccessToken,
  getRefreshToken,
  //getAccessToken,
  deleteRefreshToken,
  deleteAccessToken,
  pool
};
