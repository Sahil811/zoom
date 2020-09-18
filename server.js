const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { ExpressPeerServer } = require("peer");

const app = express();

const server = require("http").Server(app);
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

const io = require("socket.io")(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/peerjs", peerServer);
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});

server.listen(8000, () => console.log("Running in port 8000"));
