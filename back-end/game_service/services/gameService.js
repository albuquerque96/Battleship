const gameLogic = require('../utils/gameLogic');

const createGame = async (playerId, boardSize) => {
  if (boardSize < 10 || boardSize > 15) {
    throw new Error('Invalid board size');
  }
  const initialState = gameLogic.createInitialState(boardSize);
  return await Game.create(playerId, boardSize, initialState);
};

const matchGame = async (playerId, gameId) => {
  const game = await Game.findById(gameId);
  if (!game || game.state !== 'WaitingForMatch') {
    throw new Error('Game not available for matching');
  }
  await Game.update(gameId, { 
    player2_id: playerId, 
    state: 'FleetCreation',
    fleet_creation_deadline: new Date(Date.now() + 60000) // 60 seconds from now
  });
  return game;
};

const submitFleet = async (gameId, playerId, fleet) => {
  const game = await Game.findById(gameId);
  if (!game || game.state !== 'FleetCreation') {
    throw new Error('Game not in fleet creation state');
  }
  if (new Date() > game.fleet_creation_deadline) {
    throw new Error('Fleet creation time expired');
  }
  if (!gameLogic.isValidFleet(fleet, game.board_size)) {
    throw new Error('Invalid fleet configuration');
  }
  
  const playerField = playerId === game.player1_id ? 'player1_fleet' : 'player2_fleet';
  await Game.update(gameId, { 
    [`game_state.${playerField}`]: fleet 
  });

  if (game.game_state.player1_fleet && game.game_state.player2_fleet) {
    await Game.update(gameId, { 
      state: 'Ongoing',
      current_player_id: game.player1_id,
      round_deadline: new Date(Date.now() + 30000) // 30 seconds from now
    });
  }

  return game;
};

const makeMove = async (gameId, playerId, moves) => {
  const game = await Game.findById(gameId);
  if (!game || game.state !== 'Ongoing') {
    throw new Error('Game not in ongoing state');
  }
  if (game.current_player_id !== playerId) {
    throw new Error('Not your turn');
  }
  if (new Date() > game.round_deadline) {
    throw new Error('Round time expired');
  }
  if (moves.length > 3) {
    throw new Error('Too many moves');
  }

  const result = gameLogic.processMoves(game.game_state, playerId, moves);
  const newState = result.gameOver ? 'Completed' : 'Ongoing';
  const nextPlayerId = playerId === game.player1_id ? game.player2_id : game.player1_id;

  await Game.update(gameId, { 
    game_state: result.newState,
    state: newState,
    current_player_id: nextPlayerId,
    round_deadline: new Date(Date.now() + 30000) // 30 seconds from now
  });

  if (result.gameOver) {
    await updatePlayerStats(game, result);
  }

  return result;
};

const getGameState = async (gameId, playerId) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  return gameLogic.getVisibleState(game, playerId);
};

module.exports = { createGame, matchGame, submitFleet, makeMove, getGameState };