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
app.use("/client-app1", express.static(path.join(__dirname, "../client-app1")));
app.use("/app2", express.static(path.join(__dirname, "app2")));

let users = [];
let nextUserId = 1;

app.post("/users", (req, res) => {
  const {userInput} = req.body;
  const userId = nextUserId;
  nextUserId++;
  
  users.push({id: userId, username: userInput});
  res.status(201).send({ message: "Registro completado", userId: userId });
  
})

io.on("connection", (socket) => {
  socket.on("coordenadas", (data) => {
    console.log(data);
    io.emit("coordenadas", data);
  });
});

httpServer.listen(5050);