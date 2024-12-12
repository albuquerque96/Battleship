const express = require('express');
const router = express.Router();
const { createGame, matchGame, submitFleet, makeMove, getGameState } = require('../controllers/gameContoller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post("/create",authMiddleware, createGame);
router.post("/match",authMiddleware, matchGame);
router.post("/:gameId/fleet",authMiddleware, submitFleet);
router.post("/:gameId/move",authMiddleware, makeMove);
router.get("/:gameId", getGameState);

module.exports = router;