// src/socket.js
import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  autoConnect: true,
});

// export const socket = io(process.env.REACT_APP_SERVER_URL);

