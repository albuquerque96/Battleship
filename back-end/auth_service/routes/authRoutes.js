const express = require('express');
const router = express.Router();
const { register, login, refreshAccessToken,logout } = require('../controllers/authController');
const authMiddleware = require("../middleware/auth");
router.post('/register', register);
router.post('/login', login);
router.post('/logout',authMiddleware, logout);
router.post('/refresh-token', refreshAccessToken);

module.exports = router;