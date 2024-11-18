const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Joueur connecté: ", socket.id);

  socket.on("disconnect", () => {
    console.log("Joueur déconnecté: ", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`listen on port ${PORT}`);
});
