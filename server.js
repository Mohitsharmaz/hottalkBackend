const express = require("express");
const chats = require("./data/data");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDb = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

connectDb();
const app = express();
app.use(express.json()); // to accept json data
app.use(cors());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("serrver started at port", PORT);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
  pingTimeOut: 60000,
});

io.on("connection", (socket) => {
  console.log("connected to socket io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined the room", room);
  });

  socket.on("new message", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;
    console.log("heyyheyy new msg here")
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("typing", (room) => 
  {console.log("room is typing", room)
    socket.in(room).emit("typing")});
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
});
