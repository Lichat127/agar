const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = 3000;
const server = http.createServer(app);

const gameState = {
  players: {},
  food: {},
};

const GAME_PARAM = {
  FOOD_COUNT: 100,
  WORLD_WIDTH: 2000,
  WORLD_HEIGHT: 2000,
  PLAYER_INIT_RADIUS: 30,
  FOOD_RADIUS: 5,
  COLORS: ["red", "blue", "green", "yellow", "purple", "orange"],
  UPDATE_INTERVAL: 1000 / 10,
  INIT_SPEED: 5,
  MIN_SPEED: 1,
};

function getRandomPosition(max) {
  return Math.floor(Math.random() * max);
}

function getRandomColor() {
  const i = getRandomPosition(GAME_PARAM.COLORS.length);
  return GAME_PARAM.COLORS[i];
}

function initFood() {
  for (let i = 0; i < GAME_PARAM.FOOD_COUNT; i++) {
    const newFood = {
      id: i,
      x: getRandomPosition(GAME_PARAM.WORLD_WIDTH),
      y: getRandomPosition(GAME_PARAM.WORLD_HEIGHT),
      r: GAME_PARAM.FOOD_RADIUS,
      color: getRandomColor(),
    };
    gameState.food[i] = newFood;
  }
}

function initPlayer(socket) {
  const player = {
    id: socket.id,
    x: getRandomPosition(GAME_PARAM.WORLD_WIDTH),
    y: getRandomPosition(GAME_PARAM.WORLD_HEIGHT),
    r: GAME_PARAM.PLAYER_INIT_RADIUS,
    color: getRandomColor(),
    speed: GAME_PARAM.INIT_SPEED,
  };
  gameState.players[socket.id] = player;
  return player;
}

function getSpeed(radius) {
  const diff = radius - GAME_PARAM.PLAYER_INIT_RADIUS;
  const reduc = diff * 0.1;
  let speed = GAME_PARAM.INIT_SPEED - reduc;
  if (speed < GAME_PARAM.MIN_SPEED) {
    speed = 1;
  }
  return speed;
}

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  const player = initPlayer(socket);
  console.log("Player connected: ", player);

  socket.on("updatePosition", ({ x, y }) => {
    if (gameState.players[socket.id]) {
      gameState.players[socket.id].x = x;
      gameState.players[socket.id].y = y;
    }
  });

  socket.on("eatFood", (foodId) => {
    if (gameState.food[foodId] && gameState.players[socket.id]) {
      gameState.players[socket.id].r += 0.01;
      gameState.players[socket.id].speed = getSpeed(
        gameState.players[socket.id].r
      );
      gameState.food[foodId].x = getRandomPosition(GAME_PARAM.WORLD_WIDTH);
      gameState.food[foodId].y = getRandomPosition(GAME_PARAM.WORLD_HEIGHT);
      io.emit("update", gameState);
    }
  });

  socket.on("eatPlayer", (victimId) => {
    const victim = gameState.players[victimId];
    if (victim) {
      gameState.players[socket.id].r += victim.r;
      delete gameState.players[victimId];
    }
    io.emit("update", gameState);
  });

  socket.on("restart", (newPlayer) => {
    gameState.players[socket.id] = {
      ...newPlayer,
      id: socket.id,
    };
    io.emit("update", gameState);
  });

  socket.on("disconnect", () => {
    delete gameState.players[socket.id];
    console.log("Joueur déconnecté: ", socket.id);
  });
});

function startGame() {
  setInterval(() => {
    io.emit("update", gameState);
  }, GAME_PARAM.UPDATE_INTERVAL);
}

function startServer() {
  initFood();
  startGame();
  server.listen(PORT, () => {
    console.log(`listen on port ${PORT}`);
  });
}

startServer();
