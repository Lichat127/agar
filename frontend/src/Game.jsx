import { useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

const socket = io(SOCKET_URL);

const Game = () => {
  useEffect(() => {
    socket.on("connect", () => console.log("Connecté au serveur WebSocket"));

    return () => {
      socket.off("connect");
    };
  }, []);

  return <h1>Websocket</h1>;
};

export default Game;
