import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Food from "../components/Food";
import Player from "../components/Player";

const SOCKET_URL = "http://localhost:3000";
const WORLD_SIZE = { width: 2000, height: 2000 };
const VIEWPORT_SIZE = { width: 800, height: 600 };

const socket = io(SOCKET_URL);

const Game = () => {
  const [player, setPlayer] = useState({
    x: 400,
    y: 300,
    r: 30,
    color: "blue",
  });
  const [players, setPlayers] = useState({});
  const [food, setFood] = useState({});

  useEffect(() => {
    socket.on("connect", () => console.log("Connecté au serveur WebSocket"));

    socket.on("update", (data) => {
      setPlayers(data.players);
      setFood(data.food);
      if (data.players[socket.id]) {
        setPlayer(data.players[socket.id]);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("update");
    };
  }, []);

  return (
    <div>
      <h1>Agario</h1>
      <svg
        width={VIEWPORT_SIZE.width}
        height={VIEWPORT_SIZE.height}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f0f0f0",
          border: "1px solid black",
        }}
      >
        {Object.values(food).map((smallFood) => {
          return (
            <Food
              key={smallFood.id}
              x={smallFood.x}
              y={smallFood.y}
              r={smallFood.r}
              color={smallFood.color}
            />
          );
        })}
        <Player x={player.x} y={player.y} r={player.r} color={player.color} />
        {Object.values(players)
          .filter((player) => player.id !== socket.id)
          .map((player) => {
            return (
              <Player
                key={player.id}
                x={player.x}
                y={player.y}
                r={player.r}
                color={player.color}
              />
            );
          })}
      </svg>
    </div>
  );
};

export default Game;
