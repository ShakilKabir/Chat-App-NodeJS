const express = require("express");
const path = require("path");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const Filter = require("bad-words");
const filter = new Filter();
const {
  generateMessages,
  generateLocationMessages,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");
console.log(publicDirectoryPath);

app.use(express.static(publicDirectoryPath));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index");
});
io.on("connection", (socket) => {
  socket.on("join", (options, callback) => {
    const { user, error } = addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessages("Admin", "Welcome!"));
    socket
      .to(user.room)
      .broadcast.emit(
        "message",
        generateMessages("Admin", `${user.username} has joined`)
      );
    const usersInRoom = getUsersInRoom(user.room);
    io.to(user.room).emit("roomData", user.room, usersInRoom);
    callback();
  });

  socket.on("sendMessage", (text, cb) => {
    const user = getUser(socket.id);
    if (filter.isProfane(text)) {
      return cb("Don't use profane words");
    }
    io.to(user.room).emit("message", generateMessages(user.username, text));
    cb();
  });

  socket.on("sendLocation", (coords, cb) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessages(
        user.username,
        `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    cb();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessages("Admin", `${user.username} has left the chat`)
      );
      const usersInRoom = getUsersInRoom(user.room);
      io.to(user.room).emit("roomData", user.room, usersInRoom);
    }
  });
});

server.listen(port, () => {
  console.log(`server is up and running in port ${port}`);
});
