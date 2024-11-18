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
  };
  gameState.players[socket.id] = player;
  return player;
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

  socket.emit("update", gameState);

  socket.on("disconnect", () => {
    delete gameState.players[socket.id];
    console.log("Joueur déconnecté: ", socket.id);
  });
});

function startServer() {
  initFood();
  server.listen(PORT, () => {
    console.log(`listen on port ${PORT}`);
  });
}

startServer();
