import { Server } from "socket.io";
import http from "http";
import { office_items } from "./office_items.js";
import pathfinding from "pathfinding";

// SERVER STUFFF
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// CONSTANTS
const characters = [];
const items = [
  // Table and Charis for Meeting Eating
  {
    ...office_items.chair,
    gridPosition: [1, 17],
    rotation: 1,
  },
  {
    ...office_items.chair,
    gridPosition: [1, 14],
    rotation: 1,
  },
  {
    ...office_items.chair,
    gridPosition: [6, 17],
    rotation: -1,
  },
  {
    ...office_items.chair,
    gridPosition: [6, 14],
    rotation: -1,
  },
  {
    ...office_items.table,
    gridPosition: [3, 12],
    rotation: 0,
  },
  {
    ...office_items.rug_squared,
    gridPosition: [2, 14],
    rotation: 0.5,
  },
  // Chill Zone
  {
    ...office_items.couch_small,
    gridPosition: [0, 4],
    rotation: 1,
  },
  {
    ...office_items.couch_medium,
    gridPosition: [2, 0],
    rotation: 0,
  },
  {
    ...office_items.rug_rounded,
    gridPosition: [1, 1],
    rotation: 0.5,
  },
  // Desks
  {
    ...office_items.desk_full_complete,
    gridPosition: [13, 4],
    rotation: 2,
  },
  {
    ...office_items.desk_full_complete,
    gridPosition: [13, 6],
    rotation: 0,
  },
  {
    ...office_items.desk_full_chair,
    gridPosition: [14, 2],
    rotation: 2,
  },
  {
    ...office_items.desk_full_chair,
    gridPosition: [14, 8],
    rotation: 0,
  },
  {
    ...office_items.recycling_bins,
    gridPosition: [0, 10],
    rotation: 0,
  },
  {
    ...office_items.white_board,
    gridPosition: [14, 0],
    rotation: 0,
  },
  {
    ...office_items.white_board,
    gridPosition: [18, 0],
    rotation: 3,
  },

  // Ceiling
  {
    ...office_items.ceiling_fan,
    gridPosition: [10, 10],
    rotation: 0,
  },
  // Storages
  {
    ...office_items.step_cubby_storage,
    gridPosition: [8, 1],
    rotation: 1,
  },
  {
    ...office_items.step_cubby_storage,
    gridPosition: [0, 8],
    rotation: 2,
  },

  {
    ...office_items.desk_wood_screen,
    gridPosition: [12, 16],
    rotation: 1,
  },
  {
    ...office_items.office_plant_broad,
    gridPosition: [12, 13],
    rotation: 1,
  },
  // {
  //   ...office_items.iMac,
  //   gridPosition: [12, 13],
  //   rotation: 1,
  // },
  // {
  //   ...office_items.desk_wood,
  //   gridPosition: [12, 13],
  //   rotation: 1,
  // },
];
const map = {
  size: [10, 10],
  gridDivision: 2,
  items,
};
const grid = new pathfinding.Grid(
  map.size[0] * map.gridDivision,
  map.size[1] * map.gridDivision
);
const finder = new pathfinding.AStarFinder({
  allowDiagonal: true,
  dontCrossCorners: true,
});

// FUNCTIONS
const updateGrid = () => {
  map.items.forEach((item) => {
    if (item.walkable || item.wall) {
      return;
    }
    const width =
      item.rotation === 1 || item.rotation === 3 ? item.size[1] : item.size[0];
    const height =
      item.rotation === 1 || item.rotation === 3 ? item.size[0] : item.size[1];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        console.log(
          item.gridPosition[0] + x,
          item.gridPosition[1] + y,
          "x/y",
          x,
          y,
          item
        );
        grid.setWalkableAt(
          item.gridPosition[0] + x,
          item.gridPosition[1] + y,
          false
        );
      }
    }
  });
};
const findPath = (start, end) => {
  const gridClone = grid.clone();
  const path = finder.findPath(start[0], start[1], end[0], end[1], gridClone);
  return path;
};

// Update der Grid
updateGrid();

// RANDOMIZER
const generateRandomPosition = (useStartingCorner = false) => {
  for (let i = 0; i < 100; i++) {
    const x =
      Math.floor(Math.random() * map.size[0] * map.gridDivision) +
      (useStartingCorner ? 14 : 0);
    const y =
      Math.floor(Math.random() * map.size[1] * map.gridDivision) +
      (useStartingCorner ? 8 : 0);
    if (grid.isWalkableAt(x, y)) {
      return [x, y];
    }
  }
};
const generateRandomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

const npc_character = {
  id: "iam-npc",
  position: [16, 8],
  hairColor: "black",
  shirtColor: "white",
  jacketColor: "black",
  trouserColor: "black",
  shoeColor: "brown",
  tieColor: "blue",
};

io.on("connection", (socket) => {
  console.log(`Hello, user connected: ${socket.id}`);

  // Characters
  characters.push({
    id: socket.id,
    position: generateRandomPosition(true),
    hairColor: generateRandomColor(),
    shirtColor: generateRandomColor(),
    jacketColor: generateRandomColor(),
    trouserColor: generateRandomColor(),
    shoeColor: generateRandomColor(),
    tieColor: generateRandomColor(),
  });

  socket.emit("hello", {
    map,
    characters,
    id: socket.id,
    items,
    npc_character,
  });

  io.emit("characters", characters);

  socket.on("move", (from, to) => {
    console.log("moving to...");
    const character = characters.find(
      (character) => character.id === socket.id
    );
    const path = findPath(from, to);
    if (!path) {
      return;
    }
    character.position = from;
    character.path = path;
    io.emit("playerMove", character);
  });

  socket.on("disconnect", () => {
    console.log(`Bye Bye, user disconnected: ${socket.id}`);
    characters.splice(
      characters.findIndex((character) => character.id === socket.id),
      1
    );
    io.emit("characters", characters);
  });
});

// Start server
server.listen(3001, () => {
  console.log("Socket.io server listening on port 3001");
});

// Handle server shutdown
const shutdown = () => {
  console.log("Shutting down server...");

  io.close(() => {
    console.log("Socket.io server closed");
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
