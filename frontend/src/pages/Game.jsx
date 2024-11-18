import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Food from "../components/Food";
import Player from "../components/Player";

const SOCKET_URL = "http://localhost:3000";
const WORLD_SIZE = { width: 2000, height: 2000 };

const socket = io(SOCKET_URL);

const Game = () => {
  const [player, setPlayer] = useState({
    x: 400,
    y: 300,
    r: 30,
    color: "blue",
    speed: 5,
  });
  const [players, setPlayers] = useState({});
  const [food, setFood] = useState({});
  const [playerPosition, setPlayerPosition] = useState({ x: 400, y: 300 });
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isGameOver, setIsGameOver] = useState(false);

  const directionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    socket.on("connect", () => console.log("Connecté au serveur WebSocket"));

    socket.on("update", (data) => {
      setPlayers(data.players);
      setFood(data.food);
      if (data.players[socket.id]) {
        setPlayer(data.players[socket.id]);
      } else {
        setIsGameOver(true);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("update");
    };
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      const map = e.currentTarget.getBoundingClientRect();
      const directionX = e.clientX - map.left - viewportSize.width / 2;
      const directionY = e.clientY - map.top - viewportSize.height / 2;

      const length = Math.sqrt(
        directionX * directionX + directionY * directionY
      );

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
    },
    [viewportSize.height, viewportSize.width]
  );

  const updatePlayerPosition = useCallback(() => {
    const { x: directionX, y: directionY } = directionRef.current;
    const deltaX = directionX * player.speed;
    const deltaY = directionY * player.speed;

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
  }, [player.speed]);

  const playerCamera = (x, y) => {
    const playerPositionX =
      (x - playerPosition.x + WORLD_SIZE.width) % WORLD_SIZE.width;
    const playerPositionY =
      (y - playerPosition.y + WORLD_SIZE.height) % WORLD_SIZE.height;
    return {
      x: (playerPositionX / WORLD_SIZE.width) * viewportSize.width,
      y: (playerPositionY / WORLD_SIZE.height) * viewportSize.height,
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

  const checkCollision = (circle1, circle2) => {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.r + circle2.r;
  };

  const handleCollision = useCallback(() => {
    Object.values(food).forEach((smallFood) => {
      if (checkCollision(player, smallFood)) {
        console.log("Le joueur mange: ", smallFood.id);
        socket.emit("eatFood", smallFood.id);
      }
    });

    Object.values(players).forEach((otherPlayer) => {
      if (otherPlayer.id !== socket.id && checkCollision(player, otherPlayer)) {
        console.log("Collision avec un autre joueur");
        if (player.r > otherPlayer.r) {
          socket.emit("eatPlayer", otherPlayer.id);
        }
      }
    });
  }, [player, players, food]);

  useEffect(() => {
    let animationFrameId;
    const gameLoop = () => {
      updatePlayerPosition();
      handleCollision();
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    gameLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [updatePlayerPosition, handleCollision]);

  const restartGame = () => {
    setIsGameOver(false);
    const newPlayer = {
      x: 400,
      y: 300,
      r: 30,
      color: "blue",
      speed: 5,
    };
    setPlayer(newPlayer);
    setPlayerPosition({ x: 400, y: 300 });
    socket.emit("restart", newPlayer);
  };

  return (
    <div>
      {isGameOver && (
        <div>
          <h1>Vous avez perdu...</h1>{" "}
          <button onClick={restartGame}>Rejouer</button>
        </div>
      )}
      {!isGameOver && (
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
      )}
    </div>
  );
};

export default Game;
