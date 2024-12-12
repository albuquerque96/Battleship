const gameService = require('../services/gameService');

const createGame = async (req, res) => {
  const { boardSize } = req.body;
  const playerId = req.user.id; // Assuming you have authentication middleware
  try {
    const game = await gameService.createGame(playerId, boardSize);
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const matchGame = async (req, res) => {
  const { gameId } = req.body;
  const playerId = req.user.id;
  try {
    const game = await gameService.matchGame(playerId, gameId);
    res.status(200).json(game);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const submitFleet = async (req, res) => {
  const { gameId, fleet } = req.body;
  const playerId = req.user.id;
  try {
    const game = await gameService.submitFleet(gameId, playerId, fleet);
    res.status(200).json(game);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const makeMove = async (req, res) => {
  const { gameId, moves } = req.body;
  const playerId = req.user.id;
  try {
    const result = await gameService.makeMove(gameId, playerId, moves);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getGameState = async (req, res) => {
  const { gameId } = req.params;
  const playerId = req.user.id;
  try {
    const state = await gameService.getGameState(gameId, playerId);
    res.status(200).json(state);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createGame, matchGame, submitFleet, makeMove, getGameState };