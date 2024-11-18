import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Food from "../components/Food";
import Player from "../components/Player";

const SOCKET_URL = "http://localhost:3000";
const PLAYER_SPEED = 5;
const WORLD_SIZE = { width: 2000, height: 2000 };

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
  const [playerPosition, setPlayerPosition] = useState({ x: 400, y: 300 });
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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

  const directionRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    const map = e.currentTarget.getBoundingClientRect();
    const directionX = e.clientX - map.left - viewportSize.width / 2;
    const directionY = e.clientY - map.top - viewportSize.height / 2;

    const length = Math.sqrt(directionX * directionX + directionY * directionY);

    if (length > 0) {
      const normalizedX = directionX / length;
      const normalizedY = directionY / length;

      directionRef.current = {
        x: normalizedX,
        y: normalizedY,
      };
    } else {
      directionRef.current = {
        x: 0,
        y: 0,
      };
    }
  }, []);

  const updatePlayerPosition = useCallback(() => {
    const { x: directionX, y: directionY } = directionRef.current;
    const deltaX = directionX * PLAYER_SPEED;
    const deltaY = directionY * PLAYER_SPEED;

    setPlayerPosition((prevPlayerPosition) => {
      const newPlayerPositionX =
        (prevPlayerPosition.x + deltaX + WORLD_SIZE.width) % WORLD_SIZE.width;
      const newPlayerPositionY =
        (prevPlayerPosition.y + deltaY + WORLD_SIZE.height) % WORLD_SIZE.height;

      const playerWorldX =
        (WORLD_SIZE.width / 2 + newPlayerPositionX) % WORLD_SIZE.width;
      const playerWorldY =
        (WORLD_SIZE.height / 2 + newPlayerPositionY) % WORLD_SIZE.height;

      setPlayer((prevPlayer) => ({
        ...prevPlayer,
        x: playerWorldX,
        y: playerWorldY,
      }));
      socket.emit("updatePosition", { x: playerWorldX, y: playerWorldY });

      return { x: newPlayerPositionX, y: newPlayerPositionY };
    });
  }, []);

  useEffect(() => {
    let animationFrameId;
    const gameLoop = () => {
      updatePlayerPosition();
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    gameLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [updatePlayerPosition]);

  const playerCamera = (x, y) => {
    const playerPositionX = viewportSize.width / 2;
    const playerPositionY = viewportSize.height / 2;

    return {
      x:
        (x - playerPosition.x + playerPositionX + WORLD_SIZE.width) %
        WORLD_SIZE.width,
      y:
        (y - playerPosition.y + playerPositionY + WORLD_SIZE.height) %
        WORLD_SIZE.height,
    };
  };

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <svg
        width={viewportSize.width}
        height={viewportSize.height}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f0f0f0",
          border: "1px solid black",
        }}
        onMouseMove={handleMouseMove}
      >
        {Object.values(food).map((smallFood) => {
          const { x, y } = playerCamera(smallFood.x, smallFood.y);
          return (
            <Food
              key={smallFood.id}
              x={x}
              y={y}
              r={smallFood.r}
              color={smallFood.color}
            />
          );
        })}
        <Player
          x={viewportSize.width / 2}
          y={viewportSize.height / 2}
          r={player.r}
          color={player.color}
        />
        {Object.values(players)
          .filter((player) => player.id !== socket.id)
          .map((player) => {
            const { x, y } = playerCamera(player.x, player.y);
            return (
              <Player
                key={player.id}
                x={x}
                y={y}
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
