const express = require("express");
const path = require("path");
const { Server } = require("socket.io");
const { createServer } = require("http");

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  // esta es una instancia de Socket.io en nuestro servidor
  path: "/rea-time",
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use("/app1", express.static(path.join(__dirname, "app1")));
app.use("/app2", express.static(path.join(__dirname, "app2")));

let users = [];

app.get("/users", (req, res) => {
  res.send(users);
});

io.on("connection", (socket) => {
  socket.on("coordenadas", (data) => {
    console.log(data);
    io.emit("coordenadas", data);
  });
  socket.on("notificar-a-todos", (data) => {});
});

httpServer.listen(5050);