
/*authentication*/
CREATE TABLE IF NOT EXISTS users (
    player_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(player_id) unique ,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL
);


/* game*/

CREATE TABLE IF NOT EXISTS boat_type (
    boat_type_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    size INT NOT NULL
);

CREATE TABLE IF NOT EXISTS game (
    game_id SERIAL PRIMARY KEY,
    player1_id INT REFERENCES users(player_id),
    player2_id INT REFERENCES users(player_id),
    game_state JSONB, -- Current game state (fleets, shots, etc.)
    rounds JSONB, -- Round history with each player's actions
    state VARCHAR(20) NOT NULL DEFAULT 'WaitingForCreation',
    board_size INT NOT NULL DEFAULT 10,
    current_player_id INT REFERENCES users(player_id),
    fleet_creation_deadline TIMESTAMP,
    round_deadline TIMESTAMP,
    date_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_end TIMESTAMP,
    winner_id INT REFERENCES users(player_id)
);

CREATE TABLE IF NOT EXISTS player_stats (
    player_id INT REFERENCES users(player_id),
    total_games INT DEFAULT 0,
    total_hits INT DEFAULT 0,
    total_misses INT DEFAULT 0,
    total_rounds INT DEFAULT 0,
    wins INT DEFAULT 0,
    PRIMARY KEY (player_id)
);



