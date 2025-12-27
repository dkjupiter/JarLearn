const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// // เรียก auth module
// require("./routes/auth")(io);
// // เรียก class module
// require("./routes/classes")(io);
// // เรียก quiz module
// require("./routes/quizzes")(io);
// // เรียก activityPlan
// require("./routes/activityPlan")(io);
console.log("🚀 Server starting...");

// ✅ connection มีที่เดียว
io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  // เรียก auth module
  require("./routes/auth")(socket);
  // เรียก class module
  require("./routes/classes")(socket);
  // เรียก quiz module
  require("./routes/quizzes")(socket);
  // เรียก activityPlan
  require("./routes/activityPlan")(socket);
});


server.listen(4000, () => {
  console.log("Server running on port 4000");
});
